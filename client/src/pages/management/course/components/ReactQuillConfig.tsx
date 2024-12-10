import ReactQuill from 'react-quill'
import styled from 'styled-components'

// Tạo Styled Component cho Quill editor
const StyledQuill = styled(ReactQuill)`
  .ql-container {
    padding: 0; /* Xóa padding cho container */
  }

  .ql-editor {
    padding: 8px; /* Xóa padding cho editor */
    background: white;
  }
  .ql-editor img {
    display: block;
    margin-left: 0px;
    margin-right: 8px;
  }
`

// Xuất StyledQuill
export { StyledQuill }
