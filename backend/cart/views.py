from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer
from products.models import Product

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if product.stock < quantity:
            return Response(
                {'error': 'Insufficient stock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.delete()
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response(
                {'error': 'Item not found in cart'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        shipping_address = request.data.get('shipping_address')
        payment_method = request.data.get('payment_method')
        
        if not shipping_address:
            return Response(
                {'error': 'Shipping address is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not payment_method:
            return Response(
                {'error': 'Payment method is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate payment method
        valid_payment_methods = [choice[0] for choice in Order.PAYMENT_METHOD_CHOICES]
        if payment_method not in valid_payment_methods:
            return Response(
                {'error': 'Invalid payment method'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart = Cart.objects.get(user=request.user)
            if cart.items.count() == 0:
                return Response(
                    {'error': 'Cart is empty'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create order with automatic processing for demo
            order = Order.objects.create(
                user=request.user,
                shipping_address=shipping_address,
                payment_method=payment_method,
                total_amount=cart.total_price,
                status='processing'  # Automatically set to processing for demo
            )
            
            # Create order items
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )
                
                # Update stock
                product = cart_item.product
                product.stock -= cart_item.quantity
                product.save()
            
            # Clear cart
            cart.items.all().delete()
            
            # Return success message with order details
            serializer = OrderSerializer(order)
            return Response({
                'success': True,
                'message': 'Pago procesado exitosamente. Su orden ha sido confirmada.',
                'order': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to allow users to delete their own cart
        """
        cart = self.get_object()
        
        # Check if user owns the cart
        if cart.user != request.user:
            return Response(
                {'error': 'You can only delete your own cart'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        item_count = cart.items.count()
        self.perform_destroy(cart)
        
        return Response(
            {'message': f'Cart deleted successfully. {item_count} items were removed.'}, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['delete'])
    def clear_cart(self, request):
        """
        Clear all items from user's cart without deleting the cart itself
        """
        try:
            cart = Cart.objects.get(user=request.user)
            item_count = cart.items.count()
            cart.items.all().delete()
            
            return Response(
                {'message': f'Cart cleared successfully. {item_count} items were removed.'}, 
                status=status.HTTP_200_OK
            )
        except Cart.DoesNotExist:
            return Response(
                {'message': 'No cart found to clear'}, 
                status=status.HTTP_200_OK
            )
    
    @action(detail=False, methods=['post'])
    def update_item_quantity(self, request):
        """
        Update quantity of a specific item in cart
        """
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 0)
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantity < 0:
            return Response(
                {'error': 'Quantity cannot be negative'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            
            if quantity == 0:
                # Remove item if quantity is 0
                cart_item.delete()
                message = 'Item removed from cart'
            else:
                # Check stock availability
                if cart_item.product.stock < quantity:
                    return Response(
                        {'error': 'Insufficient stock'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = quantity
                cart_item.save()
                message = 'Item quantity updated'
            
            serializer = CartSerializer(cart)
            return Response({
                'message': message,
                'cart': serializer.data
            })
            
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response(
                {'error': 'Item not found in cart'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """
        Cancel an order if it's in a cancellable state
        """
        order = self.get_object()
        
        # Check if user owns the order or is staff
        if order.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only cancel your own orders'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if order can be cancelled
        cancellable_statuses = ['pending', 'processing']
        if order.status not in cancellable_statuses:
            return Response(
                {'error': f'Cannot cancel order with status "{order.status}". Only orders with status "pending" or "processing" can be cancelled.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Restore stock for cancelled orders
        for order_item in order.items.all():
            product = order_item.product
            product.stock += order_item.quantity
            product.save()
        
        # Update order status
        order.status = 'cancelled'
        order.save()
        
        serializer = self.get_serializer(order)
        return Response({
            'message': f'Order #{order.id} has been cancelled successfully. Stock has been restored.',
            'order': serializer.data
        })
    
    @action(detail=True, methods=['delete'])
    def delete_order(self, request, pk=None):
        """
        Permanently delete an order (staff only, and only cancelled orders)
        """
        order = self.get_object()
        
        # Only staff can delete orders
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete orders'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow deletion of cancelled orders
        if order.status != 'cancelled':
            return Response(
                {'error': 'Only cancelled orders can be deleted'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order_id = order.id
        order.delete()
        
        return Response(
            {'message': f'Order #{order_id} has been permanently deleted'}, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update order status (staff only)
        """
        order = self.get_object()
        
        # Only staff can update order status
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update order status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'error': 'Status is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid options are: {", ".join(valid_statuses)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prevent changing from delivered/cancelled to other statuses
        if order.status in ['delivered', 'cancelled'] and new_status != order.status:
            return Response(
                {'error': f'Cannot change status from "{order.status}" to "{new_status}"'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response({
            'message': f'Order #{order.id} status updated from "{old_status}" to "{new_status}"',
            'order': serializer.data
        })
