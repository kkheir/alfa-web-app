'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Tab = {
  id: string
  label: string
  icon: JSX.Element
}

type AdminTabsProps = {
  children: React.ReactNode[]
  tabs: Tab[]
  defaultTab?: string
}

export default function AdminTabs({
  children,
  tabs,
  defaultTab,
}: AdminTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id} className='w-full'>
      <TabsList className='grid w-full grid-cols-3 bg-muted/50'>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className='flex items-center gap-2 data-[state=active]:bg-background'
          >
            <span className='w-4 h-4'>{tab.icon}</span>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab, index) => (
        <TabsContent key={tab.id} value={tab.id} className='mt-4'>
          <div className='bg-card rounded-lg border'>{children[index]}</div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
