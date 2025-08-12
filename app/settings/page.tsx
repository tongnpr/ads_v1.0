'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Palette,
  Key,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- ชุดสีใหม่ ---
const colorPalettes = {
  'Vivid': [
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'red', bgColor: 'bg-red-500' },
    { name: 'purple', bgColor: 'bg-purple-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
  ],
  'Pastel & Others': [
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'yellow', bgColor: 'bg-yellow-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
    { name: 'cyan', bgColor: 'bg-cyan-500' },
    { name: 'gray', bgColor: 'bg-gray-500' },
  ]
};

type ThemeColor = keyof typeof colorPalettes['Vivid'][0] | keyof typeof colorPalettes['Pastel & Others'][0];


export default function SettingsPage() {
  const { data: session, update } = useSession();

  // --- States ---
  const [appearance, setAppearance] = useState({
    theme: (session?.user?.theme || 'light') as 'light' | 'dark',
    themeColor: (session?.user?.themeColor || 'blue'),
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });
  const [isLoading, setIsLoading] = useState< 'theme' | 'password' | null >(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string; context: 'theme' | 'password' } | null>(null);

  // --- Handlers ---
  const handleAppearanceChange = async () => {
    setIsLoading('theme');
    setFeedback(null);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'theme',
          theme: appearance.theme,
          themeColor: appearance.themeColor,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error saving theme');
      
      setFeedback({ type: 'success', message: 'บันทึกธีมสำเร็จ!', context: 'theme' });
      await update({ theme: appearance.theme, themeColor: appearance.themeColor });

    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message, context: 'theme' });
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setFeedback({ type: 'error', message: 'รหัสผ่านใหม่ไม่ตรงกัน', context: 'password' });
      return;
    }
    setIsLoading('password');
    setFeedback(null);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password',
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error changing password');
      
      setFeedback({ type: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ!', context: 'password' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message, context: 'password' });
    } finally {
      setIsLoading(null);
    }
  };

  // --- Feedback Component ---
  const FeedbackMessage = ({ context }: { context: 'theme' | 'password' }) => {
    if (feedback && feedback.context === context) {
      const isSuccess = feedback.type === 'success';
      return (
        <div className={cn("flex items-center gap-2 text-sm mt-4", isSuccess ? "text-green-600" : "text-destructive")}>
          {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          จัดการการตั้งค่าบัญชี, ธีม และความปลอดภัยของคุณ
        </p>
      </div>

      {/* --- Appearance Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Appearance</CardTitle>
          <CardDescription>ปรับแต่งหน้าตาของแอปพลิเคชันให้เป็นสไตล์ของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme: Light/Dark */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">เลือกโหมดการแสดงผลของหน้าจอ</p>
            <Select
              value={appearance.theme}
              onValueChange={(value: 'light' | 'dark') => setAppearance(p => ({ ...p, theme: value }))}
              disabled={isLoading === 'theme'}
            >
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light"><Sun className="inline-block mr-2 h-4 w-4"/>Light</SelectItem>
                <SelectItem value="dark"><Moon className="inline-block mr-2 h-4 w-4"/>Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />

          {/* Theme Color Selection */}
          <div className="space-y-3">
            <Label>Color</Label>
            <p className="text-sm text-muted-foreground">เลือกสีหลักเพื่อบ่งบอกความเป็นตัวคุณ</p>
            {Object.entries(colorPalettes).map(([paletteName, colors]) => (
              <div key={paletteName}>
                <h4 className="text-sm font-medium mb-2">{paletteName}</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setAppearance(p => ({ ...p, themeColor: color.name }))}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform duration-200 hover:scale-110",
                        color.bgColor,
                        appearance.themeColor === color.name ? 'border-primary' : 'border-transparent'
                      )}
                      aria-label={`Select ${color.name} theme`}
                      disabled={isLoading === 'theme'}
                    >
                      {appearance.themeColor === color.name && <CheckCircle className="h-5 w-5 text-white mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleAppearanceChange} disabled={isLoading === 'theme'}>
            {isLoading === 'theme' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Theme
          </Button>
          <FeedbackMessage context="theme" />
        </CardContent>
      </Card>

      {/* --- Security Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" />Security</CardTitle>
          <CardDescription>จัดการรหัสผ่านและความปลอดภัยของบัญชี</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
              <Input id="currentPassword" type="password" required disabled={isLoading === 'password'} onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} value={passwordData.currentPassword} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                <Input id="newPassword" type="password" required minLength={6} disabled={isLoading === 'password'} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} value={passwordData.newPassword} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">ยืนยันรหัสผ่านใหม่</Label>
                <Input id="confirmNewPassword" type="password" required disabled={isLoading === 'password'} onChange={e => setPasswordData(p => ({ ...p, confirmNewPassword: e.target.value }))} value={passwordData.confirmNewPassword} />
              </div>
            </div>
            <Button type="submit" disabled={isLoading === 'password'}>
              {isLoading === 'password' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Change Password
            </Button>
            <FeedbackMessage context="password" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}