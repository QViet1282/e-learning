import ReactQuill from 'react-quill'
import styled from 'styled-components'

// Tạo Styled Component cho Quill editor
const StyledQuill = styled(ReactQuill)`
  .ql-container {
    padding: 0; /* Xóa padding cho container */
  }

  .ql-editor {
    padding: 0; /* Xóa padding cho editor */
  }
  .ql-editor img {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`

// Xuất StyledQuill
export { StyledQuill }
