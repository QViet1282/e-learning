import styled from 'styled-components'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Paper, Typography } from '@mui/material'

const StyledDataGrid = styled(DataGrid)`
  .MuiDataGrid-cell:focus {
    outline: none !important;
    color: ${({ theme }) => theme.colors.text}; /* Màu chữ các dòng */
  }

  .MuiDataGrid-cell {
    color: ${({ theme }) => theme.colors.text}; /* Màu chữ các dòng */
  }

  .MuiDataGrid-columnHeader {
    color: ${({ theme }) => theme.colors.text}; /* Màu chữ tiêu đề cột */
  }
`

const StyledTypography = styled(Typography)`
  color: ${({ theme }) => theme.colors.text};
`

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.text};
`

const StyledPaper = styled(Paper)`
  color: ${({ theme }) => theme.colors.text}; 
  background-color: ${({ theme }) => theme.colors.body}; 
  box-shadow: ${({ theme }) => theme.colors.text}; /* Điều chỉnh độ bóng */
`

export { StyledDataGrid, StyledTypography, StyledButton, StyledPaper }
