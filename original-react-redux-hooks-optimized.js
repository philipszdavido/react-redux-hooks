import React, { Component, useReducer, useContext, useMemo } from 'react';
import { render } from 'react-dom';
import './index.css';
const l = console.log

const MyContext = React.createContext()
const MyProvider = MyContext.Provider;

const hasOwn = Object.prototype.hasOwnProperty

function is(x, y) {
    // if `x` is referentially equal to `y`
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y
    } else {
        return x !== x && y !== y
    }
}

function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false
    }

    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) return false

    for (var index = 0; index < keysA.length; index++) {
        if (!hasOwn.call(objB, keysA[index]) || !is(objA[keysA[index]], objB[keysB[index]])) {
            return false
        }
    }
    return true
}

function defaultSelectFactory(opts) {
    const { mapDispatchToProps, mapStateToProps } = opts
    let mergedProps = {}

    return function(store) {
        const nextState = mapStateToProps(store.state)
        const stateChanged = !shallowEqual(nextState, mergedProps)
        l(mergedProps, nextState, stateChanged)
        if (stateChanged) {
            mergedProps = nextState
            return mergedProps
        }
        return mergedProps
    }
}

function connect(mapStateToProps, mapDispatchToProps) {
    return function(Component, selectFactory = defaultSelectFactory) {

        const selectFactoryOptions = { mapDispatchToProps, mapStateToProps }

        function childStateFactory(selectFactoryOptions) {
            return selectFactory(selectFactoryOptions)
        }
        const childPropsSelector = childStateFactory(selectFactoryOptions)

        function ConnectAction() {
            const store = useContext(MyContext)
            const selectFactoryOptions = { mapDispatchToProps, mapStateToProps }

            const childProps = useMemo(() => {
                return childPropsSelector(store)
            }, [store])

            return useMemo(() => {
                l('rendering ', Component)
                const dispatchToProps = mapDispatchToProps(store.dispatch)
                const props = {...props, ...childProps, ...dispatchToProps }
                return ( 
                    <Component {...props } />
                )
            }, [childProps])
        }
        return ConnectAction
    }
}

function FirstC(props) {
    l('rendering FirstC')
    return ( 
        <div>
            <h3> { props.books } < /h3> 
            <button onClick = {() => props.dispatchAddBook("Dan Brown: Origin")}> Dispatch 'Origin' </button> 
        </div>
    )
}

function mapStateToProps(state) {
    return {
        books: state.Books
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatchAddBook: (payload) => dispatch({ type: 'ADD_BOOK', payload })
    }
}

const HFirstC = connect(mapStateToProps, mapDispatchToProps)(FirstC)

function SecondC(props) {
    l('rendering SecondC')
    return ( 
        <div>
            <h3> { props.user } </h3> 
            <button onClick={()=> props.dispatchAddUser("Dan Brown")}> Dispatch 'Dan Brown' </button> 
        </div >
    )
}

function mapStateToProps(state) {
    return {
        user: state.User
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatchAddUser: (payload) => dispatch({ type: 'ADD_USER', payload })
    }
}

const HSecondC = connect(mapStateToProps, mapDispatchToProps)(SecondC)

function App() {
    const initialState = {
        Books: 'Dan Brown: Inferno',
        User: 'Nnamdi'
    }

    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'ADD_BOOK':
                return { Books: action.payload, User: state.User }
            case 'ADD_USER':
                return { User: action.payload, Books: state.Books }
            default:
                return state
        }
    }, initialState);
    const objState = { state, dispatch }
    return ( 
        <div>
            <MyProvider value = {objState}>
                <HFirstC />
                <HSecondC />
            </MyProvider>  
        </div>
    )
}

render(<App /> , document.getElementById('root'));