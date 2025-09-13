'use client'

import { useGeneralStore } from '@/stores/general-store'
import { FC } from 'react'
import Bundles from './Bundles'
import ManageNumbers from './ManageNumbers'

interface IManagerViewProps {}

const tabViews: Record<string, JSX.Element> = {
  'manage-numbers': <ManageNumbers />,
  bundles: <Bundles />,
  // Add more tab mappings here
}

const ManagerView: FC<IManagerViewProps> = ({}) => {
  const { userTab } = useGeneralStore((state) => state)

  const content = tabViews[userTab ?? 'manage-numbers'] || <ManageNumbers />

  return <div>{content}</div>
}

export default ManagerView
