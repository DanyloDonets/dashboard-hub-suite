import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				orders: {
					DEFAULT: 'hsl(var(--orders-primary))',
					foreground: 'hsl(var(--orders-primary-foreground))',
					secondary: 'hsl(var(--orders-secondary))',
					accent: 'hsl(var(--orders-accent))',
					muted: 'hsl(var(--orders-muted))'
				},
				inventory: {
					DEFAULT: 'hsl(var(--inventory-primary))',
					foreground: 'hsl(var(--inventory-primary-foreground))',
					secondary: 'hsl(var(--inventory-secondary))',
					accent: 'hsl(var(--inventory-accent))',
					muted: 'hsl(var(--inventory-muted))'
				},
				clients: {
					DEFAULT: 'hsl(var(--clients-primary))',
					foreground: 'hsl(var(--clients-primary-foreground))',
					secondary: 'hsl(var(--clients-secondary))',
					accent: 'hsl(var(--clients-accent))',
					muted: 'hsl(var(--clients-muted))'
				},
				finance: {
					DEFAULT: 'hsl(var(--finance-primary))',
					foreground: 'hsl(var(--finance-primary-foreground))',
					secondary: 'hsl(var(--finance-secondary))',
					accent: 'hsl(var(--finance-accent))',
					muted: 'hsl(var(--finance-muted))'
				},
				logs: {
					DEFAULT: 'hsl(var(--logs-primary))',
					foreground: 'hsl(var(--logs-primary-foreground))',
					secondary: 'hsl(var(--logs-secondary))',
					accent: 'hsl(var(--logs-accent))',
					muted: 'hsl(var(--logs-muted))'
				}
			},
			backgroundImage: {
				'gradient-orders': 'var(--gradient-orders)',
				'gradient-inventory': 'var(--gradient-inventory)',
				'gradient-clients': 'var(--gradient-clients)',
				'gradient-finance': 'var(--gradient-finance)',
				'gradient-logs': 'var(--gradient-logs)'
			},
			boxShadow: {
				'orders': 'var(--shadow-orders)',
				'inventory': 'var(--shadow-inventory)',
				'clients': 'var(--shadow-clients)',
				'finance': 'var(--shadow-finance)',
				'logs': 'var(--shadow-logs)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
