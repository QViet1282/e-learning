/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Checkbox, FormControlLabel, Radio } from '@mui/material'
import { FieldValues, UseFormSetValue, useFormContext } from 'react-hook-form'
import React, { useEffect, useMemo, useState } from 'react'
import { ModalType } from '../..'
import Styled from './index.style'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export enum QUESTION_TYPE {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE'
}
// Định nghĩa một Enum cho các loại câu hỏi (MULTIPLE_CHOICE: câu hỏi trắc nghiệm nhiều lựa chọn,
// SINGLE_CHOICE: trắc nghiệm một lựa chọn).

interface Props extends QuestionProps {
  questionId?: string
  type: QUESTION_TYPE
  statusType?: ModalType
  formPayload?: FieldValues
}
// Định nghĩa interface Props với các thuộc tính được truyền vào component, bao gồm `questionId`, `type`, `statusType` và `formPayload`.

interface QuestionProps {
  no?: number
  title?: string
  option_1?: string | null
  option_2?: string | null
  option_3?: string | null
  option_4?: string | null
  option_5?: string | null
  option_6?: string | null
  option_7?: string | null
  option_8?: string | null
  option_9?: string | null
  option_10?: string | null
  option_11?: string | null
  option_12?: string | null
  option_13?: string | null
  option_14?: string | null
  option_15?: string | null
  option_16?: string | null
  value?: string
  isCorrect: boolean
  explanation?: string | null
  correctAnswer?: string | null
}
// Định nghĩa interface cho cấu trúc của một câu hỏi, chứa các thuộc tính như tiêu đề câu hỏi, các tùy chọn (option_1 đến option_16), câu trả lời đúng, giải thích, và các thông tin bổ sung khác.

interface OptionObj {
  label?: string | number
  value?: string | number
}
// Định nghĩa interface cho một tùy chọn của câu hỏi, bao gồm `label` và `value`.

interface QuestionChoiceProps {
  options?: OptionObj[]
  questionId?: string
  onChange?: UseFormSetValue<FieldValues>
  disabled?: boolean
  value?: string
  isCorrect?: boolean
  correctAnswer?: string | null
}
// Định nghĩa interface cho các thuộc tính liên quan đến câu hỏi trắc nghiệm, chẳng hạn như các tùy chọn, giá trị đã chọn, và câu trả lời đúng.

const MultiChoice = ({
  options,
  questionId,
  onChange,
  disabled,
  value,
  isCorrect,
  correctAnswer
}: QuestionChoiceProps) => {
  const [valueState, setValueState] = useState<string[]>([])

  useEffect(() => {
    if (value === '') {
      setValueState([])
    } else {
      const parseValue = value?.split('::')
      setValueState(parseValue as string[])
    }
  }, [value])
  // Dùng `useEffect` để cập nhật `valueState` mỗi khi giá trị `value` thay đổi. Nếu `value` là chuỗi rỗng,
  // thì `valueState` sẽ được đặt lại về mảng rỗng.

  if (options == null) return <></>
  // Nếu không có tùy chọn (options), trả về một phần tử rỗng.

  const handleChange = (flag: boolean, value?: string | number) => {
    const cloneState = JSON.parse(JSON.stringify(valueState))
    if (flag) {
      cloneState.push(value)
      setValueState(cloneState)
      onChange?.(questionId as string, cloneState.join('::'))
    } else {
      const newState = cloneState.filter((i: string) => i !== value)
      setValueState(newState)
      onChange?.(questionId as string, newState.join('::'))
    }
  }
  // Hàm `handleChange` xử lý thay đổi giá trị khi người dùng chọn hoặc bỏ chọn các tùy chọn.
  // Nếu `flag` là `true` (đã chọn), giá trị được thêm vào `valueState`. Nếu `flag` là `false`,
  // giá trị sẽ bị xóa khỏi `valueState`.

  const showIcon = (v?: string | number) => {
    if (isCorrect === null || isCorrect === undefined) {
      return null
    }
    if (isCorrect) {
      if (value?.split('::').includes(String(v))) return <Styled.CheckedIcon />
    } else {
      if (value?.split('::').includes(String(v))) {
        if (correctAnswer?.split('::').includes(String(v))) {
          return <Styled.CheckedIcon />
        } else {
          return <Styled.ClosedIcon />
        }
      }
    }
  }
  // Hàm `showIcon` hiển thị biểu tượng kiểm tra đúng/sai bên cạnh các tùy chọn.
  // Nếu câu trả lời đúng, nó sẽ hiển thị `CheckedIcon`. Nếu câu trả lời sai, nó sẽ hiển thị `ClosedIcon`.

  return (
    <>
      {options?.map(
        (item, index) =>
          !!item?.value && (
            <Styled.MultiChoiceContainer key={index}>
              <Checkbox
                checked={valueState.includes(String(item?.label))}
                disabled={disabled}
                onChange={(e) => handleChange(e.target.checked, item?.label)}
              />
              <Styled.MultiChoiceLabel disabled={disabled}>
                <div dangerouslySetInnerHTML={{ __html: item?.value.toString() }}></div>
              </Styled.MultiChoiceLabel>
              <Styled.ShowIcon>{showIcon(item?.label)}</Styled.ShowIcon>
            </Styled.MultiChoiceContainer>
          )
      )}
    </>
  )
}
// Component `MultiChoice` hiển thị các lựa chọn cho câu hỏi trắc nghiệm nhiều lựa chọn. Mỗi tùy chọn sẽ có một checkbox, nhãn (label), và biểu tượng chỉ ra câu trả lời đúng hay sai.

const SingleChoice = ({
  options,
  questionId,
  onChange,
  disabled,
  value = undefined,
  isCorrect
}: QuestionChoiceProps) => {
  const [state, setState] = useState<string | number | undefined>(value)

  useEffect(() => {
    if (value === undefined) {
      setState('')
    }
  }, [value])
  // Dùng `useEffect` để đặt lại `state` nếu giá trị `value` thay đổi và là `undefined`.

  if (options == null) return <></>
  // Nếu không có tùy chọn, trả về phần tử rỗng.

  const handleChange = (value?: string | number) => {
    setState(value)
    onChange?.(questionId as string, value)
  }
  // Hàm `handleChange` thay đổi giá trị đã chọn khi người dùng chọn một tùy chọn.

  const showIcon = (v?: string | number) => {
    if (isCorrect === null || isCorrect === undefined) {
      return null
    }
    if (isCorrect) {
      if (v === value) return <Styled.CheckedIcon />
    } else {
      if (v === value) return <Styled.ClosedIcon />
    }
  }
  // Hàm `showIcon` hiển thị biểu tượng kiểm tra cho câu trả lời đúng hoặc sai.

  return (
    <Styled.RadioGroupContainer
      name={questionId}
      value={state}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options?.map(
        (item, index) =>
          !!item?.value && (
            <Styled.FormControlLabelContainer key={index}>
              <FormControlLabel
                value={item?.label}
                control={<Radio />}
                label={''}
                disabled={disabled}
              />
              <div dangerouslySetInnerHTML={{ __html: item?.value.toString() }}></div>
              <Styled.ShowIcon>{showIcon(item?.label)}</Styled.ShowIcon>
            </Styled.FormControlLabelContainer>
          )
      )}
    </Styled.RadioGroupContainer>
  )
}
// Component `SingleChoice` hiển thị các lựa chọn cho câu hỏi trắc nghiệm một lựa chọn. Mỗi tùy chọn có một Radio button, nhãn, và biểu tượng.

const Question = (props: Props) => {
  const { setValue } = useFormContext()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const isInViewMode = useMemo(() => {
    return searchParams.get('status') === 'view'
  }, [searchParams])
  // Dùng `useMemo` để kiểm tra xem người dùng có đang ở chế độ xem (`view`) không dựa trên `searchParams`.

  const renderTypeQuestion = () => {
    switch (props.type) {
      case QUESTION_TYPE.SINGLE_CHOICE:
        return (
          <SingleChoice
            onChange={setValue}
            value={props?.value}
            questionId={props.questionId}
            isCorrect={props.isCorrect}
            options={[
              { value: props?.option_1 ?? '', label: 'a' },
              { value: props?.option_2 ?? '', label: 'b' },
              { value: props?.option_3 ?? '', label: 'c' },
              { value: props?.option_4 ?? '', label: 'd' }
            ]}
            disabled={isInViewMode}
          />
        )
      case QUESTION_TYPE.MULTIPLE_CHOICE:
        return (
          <MultiChoice
            onChange={setValue}
            value={props?.value === undefined ? '' : props?.value}
            questionId={props.questionId}
            isCorrect={props.isCorrect}
            options={[
              { value: props?.option_1 ?? '', label: 'a' },
              { value: props?.option_2 ?? '', label: 'b' },
              { value: props?.option_3 ?? '', label: 'c' },
              { value: props?.option_4 ?? '', label: 'd' },
              { value: props?.option_5 ?? '', label: 'e' },
              { value: props?.option_6 ?? '', label: 'f' },
              { value: props?.option_7 ?? '', label: 'g' },
              { value: props?.option_8 ?? '', label: 'h' },
              { value: props?.option_9 ?? '', label: 'i' },
              { value: props?.option_10 ?? '', label: 'j' },
              { value: props?.option_11 ?? '', label: 'k' },
              { value: props?.option_12 ?? '', label: 'l' },
              { value: props?.option_13 ?? '', label: 'm' },
              { value: props?.option_14 ?? '', label: 'n' },
              { value: props?.option_15 ?? '', label: 'o' },
              { value: props?.option_16 ?? '', label: 'p' }
            ]}
            disabled={isInViewMode}
            correctAnswer={props?.correctAnswer}
          />
        )
      default:
        return null
    }
  }
  // Hàm `renderTypeQuestion` quyết định loại câu hỏi nào sẽ được hiển thị dựa trên kiểu câu hỏi (`QUESTION_TYPE`).

  const isEmpty = useMemo(() => {
    if (!props?.questionId) return false
    return props?.formPayload?.[props?.questionId] === undefined
  }, [props?.formPayload, props?.questionId])
  // Hàm `isEmpty` kiểm tra xem câu hỏi có được trả lời hay không dựa trên form payload.

  const getTitleHTMLDisplay = useMemo(() => {
    if (!props?.title) {
      return ''
    } else {
      return props?.title
    }
  }, [props?.title])
  // Dùng `useMemo` để tối ưu hóa việc hiển thị tiêu đề câu hỏi.

  const getExplanationHTMLDisplay = useMemo(() => {
    if (!props?.explanation) {
      return ''
    } else {
      return props?.explanation.replace(/\n/g, '<br />')
    }
  }, [props?.explanation])
  // Dùng `useMemo` để tối ưu hóa việc hiển thị giải thích.

  const getCorrectAnswerDisplay = useMemo(() => {
    if (!props?.correctAnswer) {
      return ''
    } else {
      return props?.correctAnswer
    }
  }, [props?.correctAnswer])
  // Dùng `useMemo` để tối ưu hóa việc hiển thị câu trả lời đúng.

  return (
    <Styled.QuestionContainer
      isWrong={(props.statusType === ModalType.FAIL && isEmpty) || !props.isCorrect}
      isModeView={isInViewMode}
      isNotAnswer={(props.statusType === ModalType.FAIL && isEmpty && !isInViewMode)}
    >
      <Styled.QuestionTitle>
        <Styled.QuestionNo>
          {t('detail.question_no') + ' ' + props?.no}:
        </Styled.QuestionNo>
        <div dangerouslySetInnerHTML={{ __html: getTitleHTMLDisplay }}></div>
      </Styled.QuestionTitle>
      {renderTypeQuestion()}
      <Styled.QuestionExplanation>
        {props?.correctAnswer && (
          <Styled.QuestionAnswer>
          {`${t('detail.correctAnswerGuid')} ${getCorrectAnswerDisplay}`}
          </Styled.QuestionAnswer>
        )}
        {props?.explanation && (
          <>
            <Styled.QuestionExplanationTitle>
            {t('detail.explanation')}
            </Styled.QuestionExplanationTitle>
            <div dangerouslySetInnerHTML={{ __html: getExplanationHTMLDisplay }}></div>
          </>
        )}
      </Styled.QuestionExplanation>
    </Styled.QuestionContainer>
  )
}
// Component `Question` là component chính hiển thị một câu hỏi dựa trên kiểu câu hỏi (đơn/đa lựa chọn, điền chỗ trống) và xử lý việc hiển thị câu trả lời đúng, giải thích cũng như mở rộng thảo luận.

export default Question

// Tóm lại, đoạn mã này tạo ra các component khác nhau để xử lý việc hiển thị các câu hỏi trắc nghiệm (đa lựa chọn, đơn lựa chọn, điền chỗ trống)
// trong một ứng dụng React, với các tính năng như hiển thị câu trả lời đúng/sai và giải thích.
// Component Question là component chính kết hợp các phần tử đó lại với nhau.
