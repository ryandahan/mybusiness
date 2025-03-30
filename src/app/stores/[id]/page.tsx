import { StoreDetailContent } from './client-component';

export default function StoreDetailPage({ params }: { params: { id: string } }) {
  return <StoreDetailContent id={params.id} />;
}