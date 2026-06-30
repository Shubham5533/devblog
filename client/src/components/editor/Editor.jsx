import { useEffect, useRef } from 'react'
import Quill from 'quill'
import api from '../../utils/api'

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
]

export default function Editor({ value, onChange, placeholder = 'Tell your story...' }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return

    const editorEl = document.createElement('div')
    containerRef.current.appendChild(editorEl)

    const quill = new Quill(editorEl, {
      theme: 'snow',
      placeholder,
      modules: { toolbar: TOOLBAR_OPTIONS },
    })

    quillRef.current = quill

    if (value) quill.root.innerHTML = value

    quill.on('text-change', () => {
      onChangeRef.current(quill.root.innerHTML)
    })

    // Custom image handler -> upload to server
    const toolbar = quill.getModule('toolbar')
    toolbar.addHandler('image', () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()
      input.onchange = async () => {
        const file = input.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('image', file)
        try {
          const res = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', res.data.url)
          quill.setSelection(range.index + 1)
        } catch (err) {
          alert('Image upload failed')
        }
      }
    })

    return () => {
      quillRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} />
}
