import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Customization</h1>
          <p className="text-muted-foreground">Customize the text and images displayed in your checkout flow.</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="messages" className="mt-6">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="instructions">Payment Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkout Messages</CardTitle>
              <CardDescription>Customize the messages displayed during the checkout process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Welcome Message</label>
                <Input 
                  defaultValue="Welcome to our secure payment page"
                />
                <p className="text-sm text-muted-foreground">This message appears at the top of the checkout page.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Confirmation Message</label>
                <textarea 
                  className="flex min-h-20 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  defaultValue="Thank you for your payment! We will process your order shortly."
                />
                <p className="text-sm text-muted-foreground">This message appears after successful payment.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Instructions Intro</label>
                <textarea 
                  className="flex min-h-20 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  defaultValue="Please follow these instructions to complete your payment:"
                />
                <p className="text-sm text-muted-foreground">This message introduces the payment instructions.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkout Images</CardTitle>
              <CardDescription>Customize the images displayed during the checkout process.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Logo</label>
                  <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-500 dark:text-gray-400">Logo Preview</span>
                    </div>
                    <Button size="sm">Upload Logo</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Methods Image</label>
                  <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-500 dark:text-gray-400">Payment Methods Preview</span>
                    </div>
                    <Button size="sm">Upload Image</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructions" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Payment instructions customization options will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
} 