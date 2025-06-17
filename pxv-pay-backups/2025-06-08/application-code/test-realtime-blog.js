const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtimeUpdates() {
  try {
    console.log('🚀 Testing real-time blog updates...')

    // Get the first blog post
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .limit(1)

    if (error || !posts || posts.length === 0) {
      console.error('No blog posts found to update')
      return
    }

    const post = posts[0]
    console.log(`📝 Found post: "${post.title}"`)

    // Update the post title to demonstrate real-time updates
    const originalTitle = post.title
    const testTitle = `${originalTitle} [REAL-TIME TEST]`

    console.log(`🔄 Updating title to: "${testTitle}"`)
    
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ 
        title: testTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)

    if (updateError) {
      console.error('Error updating post:', updateError)
      return
    }

    console.log('✅ Post updated! Check your blog page - it should update in real-time.')
    console.log('⏰ Waiting 5 seconds before reverting...')

    // Wait 5 seconds, then revert the change
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log(`🔄 Reverting title back to: "${originalTitle}"`)
    
    const { error: revertError } = await supabase
      .from('blog_posts')
      .update({ 
        title: originalTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)

    if (revertError) {
      console.error('Error reverting post:', revertError)
      return
    }

    console.log('✅ Title reverted back to original!')
    console.log('🎉 Real-time test completed successfully!')

  } catch (error) {
    console.error('Error during test:', error)
  }
}

async function createTestPost() {
  try {
    console.log('📰 Creating a test blog post...')

    // Find a super admin
    const { data: superAdmin, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)
      .single()

    if (adminError || !superAdmin) {
      console.error('No super admin found')
      return
    }

    const testPost = {
      title: 'Real-time Test Post',
      slug: `realtime-test-${Date.now()}`,
      content: `# This is a test post

This post was created to test the real-time functionality of the blog system.

## Features Being Tested

- Real-time updates when posts are created
- Real-time updates when posts are published/unpublished
- Real-time updates when posts are deleted

This post will be deleted shortly to complete the test.`,
      excerpt: 'A test post to demonstrate real-time blog functionality.',
      published: true,
      author_id: superAdmin.id,
      tags: ['test', 'realtime', 'demo'],
      published_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(testPost)
      .select()
      .single()

    if (error) {
      console.error('Error creating test post:', error)
      return
    }

    console.log(`✅ Test post created: "${data.title}" (${data.slug})`)
    console.log('👀 Check your blog page - it should appear in real-time!')
    console.log('⏰ Waiting 10 seconds before deleting...')

    // Wait 10 seconds, then delete the post
    await new Promise(resolve => setTimeout(resolve, 10000))

    console.log('🗑️ Deleting test post...')
    
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', data.id)

    if (deleteError) {
      console.error('Error deleting test post:', deleteError)
      return
    }

    console.log('✅ Test post deleted!')
    console.log('👀 Check your blog page - it should disappear in real-time!')
    console.log('🎉 Real-time create/delete test completed!')

  } catch (error) {
    console.error('Error during test:', error)
  }
}

// Get command line argument
const command = process.argv[2]

if (command === 'update') {
  testRealtimeUpdates()
} else if (command === 'create') {
  createTestPost()
} else {
  console.log(`
📝 Real-time Blog Test Script

Usage:
  node test-realtime-blog.js update   - Test updating an existing post
  node test-realtime-blog.js create   - Test creating and deleting a new post

Make sure your blog page (/blog) is open in your browser to see the real-time updates!
  `)
} 