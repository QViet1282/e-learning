import styled from 'styled-components'

const Styled = {
  ButtonContainer: styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`,
  CloseButton: styled.div`
    position: absolute;
    cursor: pointer;
    top: 10px;
    right: 10px;
    &:hover {
        color: grey;
    }
 `,
  ModalContainer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
`,
  ModalChildren: styled.div`
    position: relative;
    background: white;
    padding: 32px;
    border-radius: 8px;
    min-width: 300px;
    max-width: 500px; // Increase modal width
    // min-height: 300px; // Loại bỏ dòng này
  `,
  // ...existing code...
  ModalTitle: styled.div`
    font-weight: bold;
    font-size: 24px; // Reduce font size
    text-align: center;
    word-break: break-word;
  `,
  // ...existing code...
  ModalDescription: styled.div`
    margin-top: 12px;
    font-size: 14px; // Reduce font size
    text-align: center;
    word-break: break-word;
  `,
  OKButton: styled.button`
    outline: none;
    border: none;
    color: white;
    height: 40px;
    cursor: pointer;
    background-color: #3B82F8;
    border-radius: 8px;
    width: 100px;
    &:hover {
      background-color: #285FB8;
    }
  `,
  CancelButton: styled.button`
    outline: none;
    border: 2px solid red;
    cursor: pointer;
    background-color: white;
    color: red;
    border-radius: 8px;
    height: 40px;
    width: 100px;
    &:hover {
      background-color: #ffe6e6;
    }
  `
}

export default Styled
