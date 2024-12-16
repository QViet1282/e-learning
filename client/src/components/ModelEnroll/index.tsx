/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import Modal from '@mui/material/Modal'
import Styled from './index.style'
import Close from '@mui/icons-material/Close'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  onClose?: () => void
  onOk?: () => void
  onCancel?: () => void
  cancelText?: string
  okText?: string
}
const ModelEnrollComponent = ({
  isOpen,
  title,
  description,
  onClose,
  onOk,
  onCancel,
  cancelText = 'Hủy',
  okText = 'Đồng ý'
}: Props) => {
  return (
    <Modal open={isOpen}>
      <Styled.ModalContainer>
        <Styled.ModalChildren>
          <Styled.CloseButton onClick={onClose}>
            <Close />
          </Styled.CloseButton>
          <Styled.ModalTitle>{title}</Styled.ModalTitle>
          <Styled.ModalDescription>{description}</Styled.ModalDescription>
          <Styled.ButtonContainer>
            <Styled.OKButton onClick={onOk}>{okText}</Styled.OKButton>
            <Styled.CancelButton onClick={onCancel}>{cancelText}</Styled.CancelButton>
          </Styled.ButtonContainer>
        </Styled.ModalChildren>
      </Styled.ModalContainer>
    </Modal>
  )
}

export default ModelEnrollComponent
