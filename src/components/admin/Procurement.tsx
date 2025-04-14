import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price: string;
  description?: string;
  type: 'one-time' | 'subscription';
  metadata?: any;
}

const Procurement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'one-time-procurement',
      name: 'OneTime Buy (per procurement)',
      price: '499 NOK',
      type: 'one-time',
    },
    {
      id: 'subscription-1-user',
      name: 'Subscription (1 user)',
      price: '799 NOK /month',
      type: 'subscription',
      metadata: { max_users: 1 },
    },
    {
      id: 'subscription-2-5-users',
      name: 'Subscription (2-5 users)',
      price: '1199 NOK /month',
      type: 'subscription',
      metadata: { max_users: '2-5' },
    },
    {
      id: 'subscription-6-10-users',
      name: 'Subscription (6-10 users)',
      price: '3999 NOK /month',
      type: 'subscription',
      metadata: { max_users: '6-10' },
    },
    {
      id: 'subscription-10-plus-users',
      name: 'Subscription (10+ users)',
      price: 'Contact us',
      type: 'subscription',
      metadata: { max_users: '10+' },
    },
  ]);
  const { session } = useAuth();

  // TODO: Fetch products from Stripe API instead of hardcoding

  const handlePurchase = async (productId: string) => {
    if (!session) {
      alert('You must be logged in to make a purchase.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout-session', {
        body: {
          priceId: productId, // Use product ID as price ID for simplicity
          tenantId: session?.user.id, // Assuming user.id is the tenant ID
          successUrl: `${window.location.origin}/dashboard`, // Redirect to dashboard on success
          cancelUrl: window.location.href, // Stay on the same page on cancel
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Failed to initiate purchase. Please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-secondary/30 space-y-4">
      <h3 className="text-lg font-medium">Procurement (Feature 0.6)</h3>
      <p className="text-muted-foreground">Purchase ProcuraScore licenses.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded-md bg-background space-y-2">
            <h4 className="text-md font-medium">{product.name}</h4>
            <p className="text-muted-foreground">{product.price}</p>
            {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
            <Button onClick={() => handlePurchase(product.id)}>
              {product.price === 'Contact us' ? 'Contact us' : 'Purchase'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Procurement;
