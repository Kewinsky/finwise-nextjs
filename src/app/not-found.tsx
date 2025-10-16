import { MessageComponent } from '@/components/common/message-component';

export default function NotFoundPage() {
  return <MessageComponent type="not-found" showHomeButton={true} showBackButton={true} />;
}
