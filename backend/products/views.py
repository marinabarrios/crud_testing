from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        category = self.get_object()
        products = Product.objects.filter(category=category, is_active=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to check for product dependencies
        """
        category = self.get_object()
        
        # Check if user has permission (staff only)
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete categories'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if category has products
        product_count = Product.objects.filter(category=category).count()
        if product_count > 0:
            return Response(
                {
                    'error': f'Cannot delete category. It has {product_count} product(s) associated.',
                    'suggestion': 'Move or delete all products in this category first.'
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category_name = category.name
        self.perform_destroy(category)
        
        return Response(
            {'message': f'Category "{category_name}" has been deleted'}, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['delete'])
    def force_delete(self, request, pk=None):
        """
        Force delete a category and deactivate all its products
        Only for superusers
        """
        category = self.get_object()
        
        # Only superusers can force delete
        if not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can force delete categories'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Deactivate all products in this category
        products = Product.objects.filter(category=category)
        product_count = products.count()
        products.update(is_active=False)
        
        category_name = category.name
        category.delete()
        
        return Response(
            {
                'message': f'Category "{category_name}" has been deleted and {product_count} products have been deactivated'
            }, 
            status=status.HTTP_200_OK
        )

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if query:
            products = Product.objects.filter(
                name__icontains=query,
                is_active=True
            )
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        quantity = request.data.get('quantity', 0)
        
        if quantity < 0:
            return Response(
                {'error': 'Quantity cannot be negative'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.stock = quantity
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to implement soft delete
        Instead of deleting the product, set is_active to False
        """
        product = self.get_object()
        
        # Check if user has permission (staff only)
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete products'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete: set is_active to False
        product.is_active = False
        product.save()
        
        return Response(
            {'message': f'Product "{product.name}" has been deactivated'}, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['delete'])
    def hard_delete(self, request, pk=None):
        """
        Permanently delete a product from database
        Only for superusers
        """
        product = self.get_object()
        
        # Only superusers can hard delete
        if not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can permanently delete products'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        product_name = product.name
        product.delete()
        
        return Response(
            {'message': f'Product "{product_name}" has been permanently deleted'}, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """
        Reactivate a deactivated product
        """
        # Get product including inactive ones
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user has permission (staff only)
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can reactivate products'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if product.is_active:
            return Response(
                {'message': 'Product is already active'}, 
                status=status.HTTP_200_OK
            )
        
        product.is_active = True
        product.save()
        
        serializer = self.get_serializer(product)
        return Response({
            'message': f'Product "{product.name}" has been reactivated',
            'product': serializer.data
        })