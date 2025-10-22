import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setIsLoading(false);
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6 bg-slate-900 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold">DocNhanh</CardTitle>
          <CardDescription className="text-slate-300 mt-2">
            Đăng nhập vào hệ thống quản lý nội dung
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-semibold">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                disabled={isLoading}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-slate-600 text-center bg-slate-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Tài khoản demo:</p>
            <div className="space-y-1">
              <p><span className="font-mono bg-white px-2 py-1 rounded">admin/admin</span> (Quản trị viên)</p>
              <p><span className="font-mono bg-white px-2 py-1 rounded">writer/writer</span> (Biên tập viên)</p>
              <p><span className="font-mono bg-white px-2 py-1 rounded">viewer/viewer</span> (Người xem)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};