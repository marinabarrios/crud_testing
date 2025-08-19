from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationSerializer

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['register', 'login']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['logout']:
            permission_classes = [permissions.AllowAny]  # Allow logout without authentication
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(
            {'error': 'Username and password required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to only allow users to delete their own profile
        or admins to delete any profile
        """
        profile = self.get_object()
        
        # Check permissions
        if request.user != profile.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own profile'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(profile)
        return Response(
            {'message': 'Profile deleted successfully'}, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to allow users to delete their own account
        and admins to delete any account
        """
        user = self.get_object()
        
        # Only allow users to delete their own account or admins to delete any account
        if request.user == user or request.user.is_staff:
            username = user.username  # Store username before deletion
            user.delete()  # Direct deletion instead of perform_destroy
            return Response(
                {'message': f'usuario {username} borrado'}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'You can only delete your own account'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['delete'])
    def delete_account(self, request, pk=None):
        """
        Custom action to delete user account with additional confirmations
        """
        user = self.get_object()
        
        # Check permissions
        if request.user != user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own account'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Optional: Add confirmation parameter
        confirm = request.data.get('confirm', False)
        if not confirm:
            return Response(
                {'error': 'Please confirm account deletion by setting confirm=true'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Store username for response
        username = user.username
        user.delete()
        
        return Response(
            {'message': f'User account {username} has been permanently deleted'}, 
            status=status.HTTP_200_OK
        )