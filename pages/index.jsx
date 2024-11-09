import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdConfirmationNumber } from "react-icons/md";
import axios from "axios";
import { format } from "date-fns";

//IMPORT COMPONENT
import CheckBox from "../Components/CheckBox";

const index = () => {
  const [editText, setEditText] = useState();
  const [todos, setTodos] = useState([]);
  const [todosCopy, setTodosCopy] = useState(todos);
  const [todoInput, setTodoInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchItem, setSearchItem] = useState(search);

  useEffect(() => {
    fetchTodos();
  }, [count]);

  const editTodo = (index) => {
    setTodoInput(todos[index].title);
    setEditIndex(index);
  }

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/todos");
      console.log(response);
      setTodos(response.data);
      setTodosCopy(response.data);
    } catch (error) {
      console.log(error)
    }
  }

  const addTodos = async () => {
    try {
      if (editIndex === -1) {
        //Add new TODO
        const response = await axios.post("http://127.0.0.1:8080/todos", {
          title: todoInput,
          completed: false,
        });
        console.log(response);
        setTodos(response.data);
        setTodosCopy(response.data);
        setTodoInput("");
      } else {
        //Update existing TODO
        const todoToUpdate = { ...todos[editIndex], title: todoInput };
        const response = await axios.put(`http://127.0.0.1:8080/todos/${todoToUpdate.id}`,
          todoToUpdate,
        );
        console.log(response);
        const updatedTodos = [...todos];
        updatedTodos[editIndex] = response.data;
        setTodos(updatedTodos);
        setTodoInput("");
        setEditIndex(-1);
        setCount(count + 1);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8080/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.log(error);
    }
  }

  const toggleCompleted = async (index) => {
    try {
      const todoToUpdate = { ...todos[index], completed: !todos[index].completed, };
      const response = await axios.put(`http://127.0.0.1:8080/todos/${todoToUpdate.id}`,todoToUpdate);
      const updatedTodos = [...todos];
      updatedTodos[index] = response.data;
      setTodos(updatedTodos);
      setCount(count + 1);
    } catch (error) {
      console.log(error);
    }
  }

  const formatDate = (dateString) => {
    try {
      const data = new Date(dateString);
      return isNaN(data.getTime()) ? "Invalid Date" : format(data, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.log(error);
    }
  }

  const renderTodos = (todosToRender)=> {
    return todosToRender.map((todo, index)=> (
      <li key={index} className="li">
        <CheckBox toggleCompleted={toggleCompleted} index={index} todo={todo}/>
        <label htmlFor="" className="form-check-label"></label>
        <span className="todo-text">
          {`${todo.title}`}
        </span>
        <span className="todo-text">
          {`${formatDate(todo.created_at)}`}
        </span>
        <span title="edit!" className="span" onClick={()=> editTodo(index)}>
          <i className="fa-solid fa-trash">
            <MdEdit />
          </i>
        </span>
        <span title= "delete!" className="span" onClick={()=> deleteTodo(todo.id)}>
          <i className="fa-solid fa-trash">
            <MdDelete />
          </i>
        </span>
      </li>
    ));
  };

  //FILTER
  const onHandleSearch = (value) => {
    const filteredTodo = todos.filter(({ title }) =>
      title.toLowerCase().includes(value.toLowerCase())
    );
    if(filteredTodo.length === 0){
      setTodos(todosCopy);
      console.log("it is default.");
    }
    else{
      setTodos(filteredTodo);
    }
  };

  const onClearSearch = ()=> {
    if(todos.length && todosCopy.length){
      setTodos(todosCopy);
    }
  };  

  useEffect(()=> {
    const timer = setTimeout(()=> setSearch(searchItem), 100);
    if(searchItem){
      onHandleSearch(searchItem);
    }
    else{
      onClearSearch();
    }
    return () => clearTimeout(timer);
  },[searchItem])

  return <div className="main-body">
    <div className="todo-app">
      <div className="input-section">
        <input 
          type="text"
          id="todoInput"
          placeholder="Add Item.."
          value={todoInput}
          onChange={(e) => setTodoInput(e.target.value)}
        />
        <button onClick={()=> addTodos()} className="add">
          {editIndex === -1 ? "Add" : "Update"}
        </button>
        <input 
        type="text"
        id="search_input"
        placeholder="Search"
        value={searchItem}
        onChange={(e) => setSearchItem(e.target.value)}
        />
      </div>
      {/* //Body */}
      <div className="todos">
        <ul className="todo-list">{renderTodos(todos)} </ul>
        {
          todos.length === 0 && (
            <div>
              <img className="face" src="/Capture.JPG" alt=""/>
              <h1 className="not-found">NO TODOS FOUND</h1>
            </div>
          )
        }
      </div>
    </div>
  </div>;
};

export default index;
