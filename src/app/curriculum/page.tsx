import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getUserCurriculumProgress } from '@/lib/actions/curriculum'
import { getAllModules } from '@/config/curriculum'
import { CurriculumHub } from './curriculum-hub'

export const metadata = {
  title: 'Curriculum | Underdog AI Sales Coach',
  description: 'Master cold calling with the 12-module Underdog methodology curriculum',
}

export default async function CurriculumPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const modules = getAllModules()
  const progress = await getUserCurriculumProgress()

  return <CurriculumHub modules={modules} progress={progress} />
}
