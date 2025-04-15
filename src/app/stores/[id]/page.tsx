import { StoreDetailContent } from './client-component';

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  return <StoreDetailContent id={resolvedParams.id} />;
}