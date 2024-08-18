/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import Modal from '@mui/material/Modal'
import Styled from './index.style'
import Close from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress' // Import component for loading indicator

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  onClose?: () => void
  onOk?: () => void
  onCancel?: () => void
  cancelText?: string
  okText?: string
  children?: React.ReactNode
  imageUrl?: string
  loading?: boolean
}
const ModalComponent = ({
  isOpen,
  title,
  description,
  onClose,
  onOk,
  onCancel,
  cancelText = 'Cancel',
  okText = 'OK',
  children,
  imageUrl,
  loading = false
}: Props) => {
  return (
    <Modal open={isOpen}>
      <Styled.ModalContainer>
        <Styled.ModalChildren>
          <Styled.CloseButton onClick={onClose}>
            <Close />
          </Styled.CloseButton>
          <Styled.ModalTitle>{title}</Styled.ModalTitle>
          {(imageUrl != null) &&
          <div className="flex items-center justify-center">
            <img className="w-24 h-24 object-cover" src={imageUrl} alt={title} />
          </div>
          }
          <Styled.ModalDescription>{description}</Styled.ModalDescription>
          <Styled.ModalDescription>{children}</Styled.ModalDescription>
          <div>
            <Styled.OKButton onClick={onOk} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : okText}
            </Styled.OKButton>
          </div>
          <div>
            <Styled.CancelButton onClick={onCancel}>
              {cancelText}
            </Styled.CancelButton>
          </div>
        </Styled.ModalChildren>
      </Styled.ModalContainer>
    </Modal>
  )
}

export default ModalComponent
