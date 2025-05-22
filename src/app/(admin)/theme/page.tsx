import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ThemePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
          <p className="text-muted-foreground">Customize the visual appearance of your checkout flow.</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="colors" className="mt-6">
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize the colors used throughout your checkout experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 border border-gray-300 dark:border-gray-700"></div>
                      <input type="text" className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" defaultValue="#3B82F6" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Secondary Color</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 border border-gray-300 dark:border-gray-700"></div>
                      <input type="text" className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" defaultValue="#4F46E5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Background Color</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"></div>
                      <input type="text" className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" defaultValue="#FFFFFF" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Text Color</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white border border-gray-300 dark:border-gray-700"></div>
                      <input type="text" className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" defaultValue="#111827" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="text-sm font-medium">Preview</label>
                <div className="mt-2 p-6 border rounded-lg bg-white dark:bg-gray-900">
                  <div className="flex gap-4 items-center justify-center">
                    <Button>Primary Button</Button>
                    <Button variant="outline">Secondary Button</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="typography" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Typography customization options will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="layout" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Layout customization options will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="branding" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Branding customization options will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
} 