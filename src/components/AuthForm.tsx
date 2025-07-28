import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onLogin: () => void;
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email === "admin@example.com" && password === "password") {
      toast({
        title: "Успішний вхід",
        description: "Ласкаво просимо до адмін-панелі!",
      });
      onLogin();
    } else {
      toast({
        title: "Помилка входу",
        description: "Невірний email або пароль",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orders-muted via-inventory-muted to-clients-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-orders bg-clip-text text-transparent">
            Адмін-панель
          </CardTitle>
          <CardDescription>
            Введіть свої дані для входу в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-orders hover:opacity-90 shadow-orders"
              disabled={isLoading}
            >
              {isLoading ? "Завантаження..." : "Увійти"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Тестові дані: admin@example.com / password
          </div>
        </CardContent>
      </Card>
    </div>
  );
}