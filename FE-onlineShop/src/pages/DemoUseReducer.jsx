import React, { useReducer } from "react";

function DemoUseReducer() {
  const userReducer = (state, action) => {
    switch (action.type) {
      case "GET_USER_REQUEST":
        return {
          ...state,
          loading: true,
        };
      case "GET_USER_SUCCESS":
        return {
          ...state,
          loading: false,
          data: action.data,
        };

      case "GET_USER_ERROR":
        return {
          ...state,
          data: [],
          error: action.data,
        };
      default:
    }
  };


  const reducer = (state, action) => {
    switch (action) {
      case "tang":
        return state + 1;
      case "giam":
        return state - 1;
      case "xoa_het_du_lieu":
        return 0;
      default:
        return state;
    }
  };

  const reducer2 = (state, action) => {
    switch (action.type) {
      case "gan":
        return state + action.data;
      default:
        return state;
    }
  };

  const initState = {
    loading: false,
    data: [],
    error: null,
  };
  const [count, dispatch] = useReducer(reducer, 0);
  const [count2, dispatch2] = useReducer(reducer2, 0);
  const [users, userDispatch] = useReducer(userReducer, initState);



  const getUsers = () => {
    userDispatch({
      type: "GET_USER_REQUEST",
    });

    // setTimeout(() => {
    fetch("https://reqres.in/api/userss")
      .then((response) => response.json())
      .then((response) => {
        userDispatch({
          type: "GET_USER_SUCCESS",
          data: response,
        });
      })
      .catch((err) => {
        userDispatch({
          type: "GET_USER_ERROR",
          data: err,
        });
      });
    // }, 2000);
  };

  return (
    <div>
      <button onClick={getUsers}>GET USERS</button>
      {users.loading ? <p>Loading...</p> :<p>{JSON.stringify(users)}</p> }
      <p>Count: {count}</p>
      <button onClick={() => dispatch("tang")}>Tang</button>
      <button onClick={() => dispatch("giam")}>Giam</button>
      <button onClick={() => dispatch("xoa_het_du_lieu")}>
        Xoa het du lieu
      </button>
      <p>Count2: {count2}</p>
      <button
        onClick={() =>
          dispatch2({
            type: "gan",
            data: 10,
          })
        }
      >
        Gan gia tri
      </button>
    </div>
  );
}

export default DemoUseReducer;
