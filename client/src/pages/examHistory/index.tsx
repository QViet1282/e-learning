/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { t } from 'i18next'
import { Box, Button } from '@mui/material'
import { getShortHistoryExams } from 'api/post/post.api'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  type MRT_ColumnDef,
  useMaterialReactTable,
  MaterialReactTable
} from 'material-react-table'

import { MRT_Localization_VI } from 'material-react-table/locales/vi'
import { i18n } from 'services/i18n'

export interface IHistory {
  examId?: string
  overAllScore?: string | number
  attempt?: number
  updatedAt?: Date | null
  numberOfQuestions?: number
  name?: string
}

interface ExamHistoryProps {
  examId: string
  onBack: () => void
  onTestExam: () => void
  onViewExam: (attempt: number) => void
}

function isVietnamese () {
  return i18n.language === 'vi'
}

const ExamHistory = ({ examId, onBack, onTestExam, onViewExam }: ExamHistoryProps) => {
  const [data, setData] = useState<IHistory[]>([] as IHistory[])

  const getData = useCallback(
    async (id?: string) => {
      try {
        const listHistoryExamsResponse = await getShortHistoryExams({ id })
        setData(listHistoryExamsResponse?.data)
      } catch (e) {
        // Xử lý lỗi nếu cần
      }
    },
    []
  )

  useEffect(() => {
    if (examId) {
      void getData(examId)
    }
  }, [getData, examId])

  const toDateString = (date: Date | null | undefined) => {
    if (date) {
      return new Date(date).toLocaleString('vi')
    } else {
      return ''
    }
  }

  const columns = useMemo<Array<MRT_ColumnDef<IHistory>>>(
    () => [
      {
        accessorKey: 'examId',
        header: t('history.exam_id'),
        enableHiding: false
      },
      {
        accessorKey: 'attempt',
        header: t('history.attempt')
      },
      {
        accessorKey: 'overAllScore',
        header: t('history.over_all_score')
      },
      {
        accessorKey: 'updatedAt',
        header: t('history.updated_at'),
        Cell: ({ row }) => {
          return <div>{toDateString(row.original.updatedAt)}</div>
        }
      },
      {
        accessorKey: 'numberOfQuestions',
        header: t('history.number_of_questions')
      },
      {
        accessorKey: 'action',
        header: t('history.action'),
        Cell: ({ row }) => {
          const onClick = () => {
            onViewExam(row.original.attempt as number)
          }
          return <Button onClick={onClick}>{t('history.review')}</Button>
        }
      }
    ],
    [onViewExam, t]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'top',
    enableFilterMatchHighlighting: false,
    localization: isVietnamese() ? MRT_Localization_VI : undefined,
    initialState: {
      columnVisibility: { examId: false }
    },
    rowNumberDisplayMode: 'original',
    layoutMode: 'grid',
    muiTableHeadCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
        fontStyle: 'bold',
        fontWeight: 'bold'
      },
      align: 'center'
    },
    muiTableBodyCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)'
      },
      align: 'center'

    }
  })

  return (
    <div className="w-11/12 mx-auto">
      <div className="bg-[#00a6d8] text-white flex justify-between items-center p-2 flex-wrap min-h-32">
        <button
          type="button"
          onClick={onBack}
              className="flex justify-center items-center px-3 py-2 bg-[#ff5858] mb-3 rounded-lg text-white hover:bg-[#d14545] border-none cursor-pointer"
        >
          <ArrowBackIcon />
          <p className="ml-2">{t('history.back')}</p>
        </button>
        <div className="text-right">
          <div>{`${t('history.exam_name')}: ${data[0]?.name}`}</div>
          <div>{`${t('history.number_of_times_done')}: ${data?.length}`}</div>
        </div>
      </div>
      <Box
        sx={{
          height: 700,
          width: '100%',
          '& .super-app-theme--header': {
            fontSize: '20px'
          }
        }}
      >
        <MaterialReactTable table={table}/>
      </Box>
    </div>
  )
}

export default ExamHistory
