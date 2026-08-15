import { cn } from '@/lib/utils';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle size={48} className="text-destructive mb-6 flex-shrink-0" />

            <h2 className="text-xl mb-4">{this.props.title ?? 'حدث خطأ غير متوقع'}</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {this.props.message ?? 'لم يتمكن المكون من التحميل. يرجى المحاولة مرة أخرى.'}
            </p>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={this.resetError}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 cursor-pointer'
                )}
              >
                <RotateCcw size={16} />
                إعادة المحاولة
              </button>

              {this.props.showHomeButton && (
                <button
                  type="button"
                  onClick={this.props.onHomeClick}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    'bg-secondary text-secondary-foreground',
                    'hover:opacity-90 cursor-pointer'
                  )}
                >
                  <Home size={16} />
                  الصفحة الرئيسية
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
