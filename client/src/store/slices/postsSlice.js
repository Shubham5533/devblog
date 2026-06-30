import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchPosts = createAsyncThunk('posts/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await api.get(`/posts?${query}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load posts')
  }
})

export const fetchPost = createAsyncThunk('posts/fetchOne', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/posts/${slug}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Post not found')
  }
})

export const fetchFeatured = createAsyncThunk('posts/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/posts/featured')
    return res.data
  } catch { return rejectWithValue('Failed') }
})

export const createPost = createAsyncThunk('posts/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/posts', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create post')
  }
})

export const updatePost = createAsyncThunk('posts/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/posts/${id}`, data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update post')
  }
})

export const deletePost = createAsyncThunk('posts/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete post')
  }
})

export const toggleLike = createAsyncThunk('posts/like', async (id, { rejectWithValue }) => {
  try {
    const res = await api.post(`/posts/${id}/like`)
    return { id, ...res.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

export const addComment = createAsyncThunk('posts/addComment', async ({ postId, content }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/posts/${postId}/comments`, { content })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed')
  }
})

export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ postId, commentId }, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/posts/${postId}/comments/${commentId}`)
    return { commentId, ...res.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

export const fetchDashboard = createAsyncThunk('posts/dashboard', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/users/${userId}/dashboard`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    list: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    currentPost: null,
    featured: [],
    dashboard: null,
    loading: false,
    postLoading: false,
    error: null,
    liked: false,
    saved: false,
  },
  reducers: {
    clearCurrentPost: (state) => { state.currentPost = null; state.liked = false; state.saved = false },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchPosts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.posts
        state.total = action.payload.total
        state.pages = action.payload.pages
        state.currentPage = action.payload.page
      })
      .addCase(fetchPosts.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      // Fetch single
      .addCase(fetchPost.pending, (state) => { state.postLoading = true; state.error = null })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.postLoading = false
        state.currentPost = action.payload.post
        state.liked = action.payload.liked
        state.saved = action.payload.saved
      })
      .addCase(fetchPost.rejected, (state, action) => { state.postLoading = false; state.error = action.payload })

      // Featured
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload.posts })

      // Create
      .addCase(createPost.fulfilled, (state, action) => {
        state.list.unshift(action.payload.post)
      })

      // Delete
      .addCase(deletePost.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p._id !== action.payload)
        if (state.dashboard) {
          state.dashboard.posts = state.dashboard.posts.filter(p => p._id !== action.payload)
        }
      })

      // Toggle like
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.liked = action.payload.liked
        if (state.currentPost) state.currentPost.likes = new Array(action.payload.likes).fill(null)
      })

      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentPost) state.currentPost.comments.push(action.payload.comment)
      })

      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        if (state.currentPost) {
          state.currentPost.comments = state.currentPost.comments.filter(c => c._id !== action.payload.commentId)
        }
      })

      // Dashboard
      .addCase(fetchDashboard.pending, (state) => { state.loading = true })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false; state.dashboard = action.payload
      })
      .addCase(fetchDashboard.rejected, (state) => { state.loading = false })
  },
})

export const { clearCurrentPost, clearError } = postsSlice.actions
export default postsSlice.reducer
