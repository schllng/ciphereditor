
import './control.scss'
import ChangingTextView from 'views/changing-text/changing-text'
import ControlDrawerView from 'views/control-drawer/control-drawer'
import IconView from 'views/icon/icon'
import MovableButtonView from 'views/movable-button/movable-button'
import OutletView from 'views/outlet/outlet'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useBlueprintSelector from 'hooks/useBlueprintSelector'
import useClassName, { mergeModifiers, ViewModifiers } from 'hooks/useClassName'
import useHighestIssueType from 'hooks/useHighestIssueType'
import { BlueprintNodeId } from 'slices/blueprint/types/blueprint'
import { ControlViewState } from 'slices/blueprint/types/control'
import { MouseEvent, useCallback, useEffect, useRef } from 'react'
import { canWireBetweenControls, getControlNode, getControlPreview } from 'slices/blueprint/selectors/control'
import { getOperationIssues } from 'slices/blueprint/selectors/operation'
import { getWireDraft } from 'slices/ui/selectors'
import { targetWireAction } from 'slices/ui'
import { toggleControlViewState } from 'slices/blueprint'

export default function ControlView (props: {
  controlId: BlueprintNodeId
  contextProgramId: BlueprintNodeId
  onOutletRef?: (controlId: number, element: HTMLDivElement | null) => void
}): JSX.Element {
  const { controlId, contextProgramId, onOutletRef } = props

  const headerRef = useRef<HTMLDivElement | null>(null)

  const control = useBlueprintSelector(state => getControlNode(state, controlId))
  const valuePreview = useBlueprintSelector(state =>
    getControlPreview(state, controlId))

  const issues = useBlueprintSelector(state => getOperationIssues(state, controlId))
  const highestIssueType = useHighestIssueType(issues)

  const isWireTarget = useAppSelector(state => getWireDraft(state.ui)?.targetControlId === controlId)
  const isPossibleWireTarget = useAppSelector(state => {
    if (state.ui.wireDraft === undefined) {
      return false
    }
    return canWireBetweenControls(
      state.blueprint.present,
      state.ui.wireDraft.sourceControlId,
      controlId
    )
  })

  const dispatch = useAppDispatch()
  const onToggleClick = useCallback((event: MouseEvent) => {
    dispatch(toggleControlViewState({ controlId }))
  }, [dispatch, controlId])

  useEffect(() => {
    const onEnter = (): void => {
      dispatch(targetWireAction({ controlId: controlId }))
    }
    const onLeave = (): void => {
      dispatch(targetWireAction({ controlId: undefined }))
    }
    const registerWireEvents = (): void => {
      if (headerRef.current !== null) {
        headerRef.current.addEventListener('pointerenter', onEnter)
        headerRef.current.addEventListener('pointerleave', onLeave)
      }
    }
    const removeWireEvents = (): void => {
      if (headerRef.current !== null) {
        window.removeEventListener('pointerenter', onEnter)
        window.removeEventListener('pointerleave', onLeave)
      }
    }
    if (isPossibleWireTarget) {
      registerWireEvents()
    } else {
      removeWireEvents()
    }
    return removeWireEvents
  }, [dispatch, headerRef, isPossibleWireTarget, controlId])

  let modifiers: ViewModifiers = control.viewState === ControlViewState.Expanded ? ['expanded'] : []

  if (isWireTarget) {
    modifiers = mergeModifiers(modifiers, ['wire-target'])
  }

  return (
    <div className={useClassName('control', modifiers)}>
      <div className='control__header' ref={headerRef}>
        <MovableButtonView
          className='control__toggle'
          onClick={onToggleClick}
          title={issues.map(i =>
            i.message + (i.description !== undefined ? ': ' + i.description : '')
          ).join('; ')}
        >
          <div className='control__pill'>
            <div className='control__chevron'>
              <IconView icon='chevronDown' />
            </div>
            <h4 className='control__name'>
              {control.label}
            </h4>
            {highestIssueType !== undefined && (
              <div className={'control__issue control__issue--' + highestIssueType}>
                <IconView
                  icon={highestIssueType}
                />
              </div>
            )}
          </div>
          {control.viewState === ControlViewState.Collapsed && valuePreview !== undefined && (
            <div className='control__preview'>
              <ChangingTextView>{valuePreview}</ChangingTextView>
            </div>
          )}
        </MovableButtonView>
        <OutletView
          control={control}
          contextProgramId={contextProgramId}
          expanded={control.viewState === ControlViewState.Expanded}
          onIndicatorClick={onToggleClick}
          indicatorRef={onOutletRef?.bind(null, controlId)}
        />
      </div>
      {control.viewState === ControlViewState.Expanded && (
        <ControlDrawerView control={control} contextProgramId={contextProgramId} />
      )}
    </div>
  )
}
