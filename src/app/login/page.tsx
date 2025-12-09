
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, auth as authService } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Target } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await authService.login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      // Try to register the demo user if they don't exist
      if (email === 'demo@example.com') {
        try {
          await authService.register(email, password, 'Demo User');
          toast({
            title: 'Success',
            description: 'Demo account created and logged in successfully!',
          });
          router.push('/');
        } catch (registerError: any) {
           toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: registerError.message || 'An unknown error occurred.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'An unknown error occurred.',
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await authService.register(email, password, name);
      toast({
        title: 'Success',
        description: 'Account created successfully! You are now logged in.',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-end bg-background p-4 overflow-hidden">
        <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
        </div>
      <Card className="w-full max-w-sm z-10 mr-0 md:mr-16">
        <CardHeader className="text-center">
          <CardTitle className="text-center">TaskSphere</CardTitle>
          <CardDescription>
            {isRegistering ? 'Create a new account.' : 'Welcome back! Please sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
               <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegistering ? 'Register' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
