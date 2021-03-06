import React, { useState, useRef, useEffect } from "react"
import { useStateValue } from "../../state"
import firebase from "firebase"

const Modify = () => {
  const [disabled, setDisabled] = useState(true),
    [error, setError] = useState(false),
    [{ user, modify }, dispatch] = useStateValue(),
    inputRef = useRef(null)

  const modifyCalories = amount => {
    const currentTotalCalories = user.totalCalories
    let updatedTotalCalories

    if (modify.add) {
      updatedTotalCalories = currentTotalCalories + amount
    } else {
      updatedTotalCalories = currentTotalCalories - amount
    }

    dispatch({
      type: "user",
      payload: {
        ...user,
        totalCalories: updatedTotalCalories
      }
    })

    firebase
      .database()
      .ref(`/users/${user.uid}`)
      .child("totalCalories")
      .set(updatedTotalCalories)
  }

  const modifyCaloricValue = e => {
    e.preventDefault()
    let value = Number(inputRef.current.value),
      total = value + user.totalCalories

    if (total >= 0) {
      modifyCalories(value)
      dispatch({
        type: "modify",
        payload: {
          ...modify,
          [modify.add ? "add" : "subtract"]: false
        }
      })
      inputRef.current.value = ""
      setDisabled(true)
    } else {
      setError(true)
    }
  }

  const handleInputValidation = e => {
    const value = e.target.value
    if (value.length > 0) {
      // prettier-ignore
      if (
        (modify.subtract && value > user.totalCalories) || value < 0 || (modify.add && value < 0)) {
        setError(true)
      } else {
        setError(false)
      }
      setDisabled(false)
    } else {
      console.log(value)
      setDisabled(true)
    }
  }

  const changeGoal = e => {
    e.preventDefault()
    editGoal(inputRef.current.value)
    dispatch({
      type: "modify",
      payload: {
        ...modify,
        edit: false
      }
    })
    setDisabled(true)
  }

  const editGoal = amount => {
    dispatch({
      type: "user",
      payload: {
        ...user,
        dailyGoal: amount
      }
    })
    firebase
      .database()
      .ref(`/users/${user.uid}`)
      .child("dailyGoal")
      .set(amount)
    dispatch({
      type: "modify",
      payload: {
        ...modify,
        edit: false
      }
    })
  }

  const toggleModify = operation =>
    dispatch({ type: "modify", payload: { ...modify, [operation]: false } })

  if (modify.add || modify.subtract) {
    return (
      <div className="modify__container modify--open">
        <div className="logout__top-bar">
          <button onClick={() => toggleModify(modify.add ? "add" : "subtract")}>
            <i className="fa fa-backspace" />
          </button>
        </div>
        <form onSubmit={modifyCaloricValue}>
          <input
            type="number"
            min="0"
            placeholder="Calories"
            className="modify__input"
            onChange={handleInputValidation}
            ref={inputRef}
            style={error ? { borderBottom: "3px solid red" } : null}
          />
          <button
            className="modify__button-submit"
            onClick={modifyCaloricValue}
            disabled={disabled || error}
          >
            Save
          </button>
          <p className={error ? "modify__error" : "hidden"}>
            {modify.add
              ? "You can't add negative calories, try subtracting instead."
              : "You can't subtract negatives or more calories than you have eaten."}
          </p>
        </form>
      </div>
    )
  } else if (modify.edit) {
    return (
      <div className="modify__container">
        <div className="logout__top-bar">
          <button onClick={() => toggleModify("edit")}>
            <i className="fa fa-backspace" />
          </button>
        </div>
        <form onSubmit={changeGoal}>
          <input
            type="number"
            min="0"
            placeholder="Daily Calories Goal"
            className="modify__input"
            onChange={handleInputValidation}
            ref={inputRef}
            style={error ? { borderBottom: "3px solid #FD8A8B" } : null}
          />
          <button
            className="modify__button-submit"
            onClick={changeGoal}
            disabled={disabled || error}
          >
            Save
          </button>
          <p className={error ? "modify__error" : "hidden"}>
            {modify.add
              ? "You can't add negative calories, try subtracting instead."
              : "You can't subtract negatives or more calories than you have eaten."}
          </p>
        </form>
      </div>
    )
  } else {
    return null
  }
}

export default Modify
