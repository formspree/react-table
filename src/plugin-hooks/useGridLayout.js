export function useGridLayout(hooks) {
  hooks.stateReducers.push(reducer)
  hooks.getTableProps.push(getTableProps)
  hooks.getHeaderProps.push(getHeaderProps)
  hooks.getRowProps.push(getRowProps)
}

useGridLayout.pluginName = 'useGridLayout'

const getTableProps = (props, { instance }) => {
  const columnWidths = instance.visibleColumns.map(column => {
    const index = instance.allColumns.findIndex(col => col.id === column.id)
    const width = instance.state.gridLayout.columnWidths[index]
    if (width === `auto`) {
      return `auto`
    }
    return `${width}px`
  })
  return [
    props,
    {
      style: {
        display: `grid`,
        gridTemplateColumns: columnWidths.join(` `),
      },
    },
  ]
}

const getRowProps = (props, { row }) => {
  if (row.isExpanded) {
    return [
      props,
      {
        style: {
          gridColumn: `1 / ${row.cells.length + 1}`,
        },
      },
    ]
  }
  return [props, {}]
}

const getHeaderProps = (props, { column }) => [
  props,
  {
    id: `header-cell-${column.id}`,
    style: {
      position: `sticky`, //enables a scroll wrapper to be placed around the table and have sticky headers
    },
  },
]

function reducer(state, action, previousState, instance) {
  if (action.type === `init`) {
    return {
      gridLayout: {
        columnWidths: instance.columns.map(() => `auto`),
      },
      ...state,
    }
  }

  if (action.type === `columnStartResizing`) {
    const { columnId } = action
    const columnIndex = instance.visibleColumns.findIndex(
      col => col.id === columnId
    )
    const elWidth = getElementWidth(columnId)

    if (elWidth !== undefined) {
      return {
        ...state,
        gridLayout: {
          ...state.gridLayout,
          columnId,
          columnIndex,
          startingWidth: elWidth,
        },
      }
    } else {
      return state
    }
  }

  if (action.type === `columnResizing`) {
    const { columnIndex, startingWidth, columnWidths } = state.gridLayout

    const change = state.columnResizing.startX - action.clientX
    const newWidth = startingWidth - change
    const columnWidthsCopy = [...columnWidths]
    columnWidthsCopy[columnIndex] = `${newWidth}px`

    return {
      ...state,
      gridLayout: {
        ...state.gridLayout,
        columnWidths: columnWidthsCopy,
      },
    }
  }
}

function getElementWidth(columnId) {
  const width = document.getElementById(`header-cell-${columnId}`)?.offsetWidth

  if (width !== undefined) {
    return width
  }
}