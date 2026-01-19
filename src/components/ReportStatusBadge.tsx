import { Tag } from '@/components/ui/Tag'

export function ReportStatusBadge(props: {
  status: 'queued' | 'generating' | 'succeeded' | 'failed'
}) {
  if (props.status === 'succeeded') return <Tag tone="success">已生成</Tag>
  if (props.status === 'failed') return <Tag tone="danger">生成失败</Tag>
  if (props.status === 'generating') return <Tag tone="warning">生成中</Tag>
  return <Tag tone="neutral">排队中</Tag>
}

