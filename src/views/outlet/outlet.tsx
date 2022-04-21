
import './outlet.scss'
import IconView from 'views/icon/icon'
import OutletSelectView from 'views/outlet-select/outlet-select'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useBlueprintSelector from 'hooks/useBlueprintSelector'
import useClassName from 'hooks/useClassName'
import { BlueprintNodeId } from 'slices/blueprint/types/blueprint'
import { ControlNode } from 'slices/blueprint/types/control'
import { MouseEventHandler, PointerEvent as ReactPointerEvent } from 'react'
import { getControlVariable, getVariableControl } from 'slices/blueprint/selectors/variable'
import { getWireDraft } from 'slices/ui/selectors'
import { startWireAction } from 'slices/ui'

export default function OutletView (props: {
  control: ControlNode
  contextProgramId: BlueprintNodeId
  expanded: boolean
  onIndicatorClick?: MouseEventHandler<HTMLDivElement>
  indicatorRef?: (element: HTMLDivElement) => void
}): JSX.Element {
  const { control, contextProgramId, indicatorRef } = props

  const dispatch = useAppDispatch()
  const attachedVariable = useBlueprintSelector(state =>
    getControlVariable(state, props.control.id, contextProgramId))
  const attachedVariableSourceControl = useBlueprintSelector(state =>
    attachedVariable !== undefined ? getVariableControl(state, attachedVariable.id) : undefined)

  const wireDraftSourceControlId = useAppSelector(state => getWireDraft(state.ui)?.sourceControlId)
  const isSourceControl = wireDraftSourceControlId === control.id
  const isUnused = !isSourceControl && attachedVariable === undefined
  const isPushing = isSourceControl || (attachedVariableSourceControl !== undefined && attachedVariableSourceControl.id === control.id)
  const variant = isUnused ? 'unused' : (isPushing ? 'push' : 'pull')

  const modifiers = [variant].concat(props.expanded ? ['expanded'] : '')

  const onPointerDown = (event: ReactPointerEvent): void => {
    event.stopPropagation()
    dispatch(startWireAction({ controlId: control.id }))
  }

  return (
    <div
      className={useClassName('outlet', modifiers)}
    >
      {props.expanded && (
        <div className='outlet__select'>
          <OutletSelectView control={control} contextProgramId={contextProgramId} />
        </div>
      )}
      <button
        className='outlet__button'
        tabIndex={-1}
        onPointerDown={onPointerDown}
      >
        <div className='outlet__indicator' ref={indicatorRef}>
          {(variant === 'unused') && (
            <IconView icon='outletUnused' />
          )}
          {(variant === 'push') && (
            <IconView icon='outletPush' />
          )}
          {(variant === 'pull') && (
            <IconView icon='outletPull' />
          )}
        </div>
      </button>
    </div>
  )
}
