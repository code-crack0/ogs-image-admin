import { AppSidebar } from '@/components/Sidebar'
import { ImageGrid } from '@/components/ImageGrid'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import ImageGallery from '@/components/ImageGallery'

// This would typically come from an API or database
const images = [
  { id: 1, src: '/placeholder.svg?height=300&width=300', alt: 'Image 1' },
  { id: 2, src: '/placeholder.svg?height=300&width=300', alt: 'Image 2' },
  { id: 3, src: '/placeholder.svg?height=300&width=300', alt: 'Image 3' },
  { id: 4, src: '/placeholder.svg?height=300&width=300', alt: 'Image 4' },
  { id: 5, src: '/placeholder.svg?height=300&width=300', alt: 'Image 5' },
  { id: 6, src: '/placeholder.svg?height=300&width=300', alt: 'Image 6' },
  { id: 7, src: '/placeholder.svg?height=300&width=300', alt: 'Image 7' },
  { id: 8, src: '/placeholder.svg?height=300&width=300', alt: 'Image 8' },
]

export default function Home() {
  return (
    <main className="flex h-screen">
      <SidebarProvider >
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-grow">
        <header className="flex items-center p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold ml-4">Image Gallery</h1>
        </header>
        <div className="flex-grow overflow-auto">
          <ImageGallery/>
        </div>
      </SidebarInset>
      </SidebarProvider>
    </main>
  )
}

