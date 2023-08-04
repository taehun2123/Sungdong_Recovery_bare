import { CategoryBar } from './component/CategoryBar'
import { SlideImg } from './component/SlideImg'
import { TopBanner } from './component/TopBanner'


export default function MainPage() {

  return (
    <div>
      <TopBanner />
    
      <CategoryBar />

      <SlideImg/>
      <hr/>
    </div>
  )
}