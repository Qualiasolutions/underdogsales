import { redirect, notFound } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getModuleProgress } from '@/lib/actions/curriculum'
import { getModuleById, getAllModules } from '@/config/curriculum'
import { ModuleDetail } from './module-detail'

interface PageProps {
  params: Promise<{ moduleId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { moduleId } = await params
  const module = getModuleById(parseInt(moduleId, 10))

  if (!module) {
    return { title: 'Module Not Found | Underdog AI' }
  }

  return {
    title: `${module.name} | Underdog Curriculum`,
    description: module.description,
  }
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { moduleId: moduleIdStr } = await params
  const moduleId = parseInt(moduleIdStr, 10)

  if (isNaN(moduleId) || moduleId < 1 || moduleId > 12) {
    notFound()
  }

  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const module = getModuleById(moduleId)

  if (!module) {
    notFound()
  }

  const allModules = getAllModules()
  const progress = await getModuleProgress(moduleId)

  // Get prev/next module info
  const prevModule = moduleId > 1 ? getModuleById(moduleId - 1) : null
  const nextModule = moduleId < 12 ? getModuleById(moduleId + 1) : null

  return (
    <ModuleDetail
      module={module}
      progress={progress}
      prevModule={prevModule}
      nextModule={nextModule}
      totalModules={allModules.length}
    />
  )
}
