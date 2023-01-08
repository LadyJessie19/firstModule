

const getUsers = async () => {
    const users = await fetch(`http://localhost:3000/users`)
    const usersResponse = await users.json()
    return usersResponse
}

const setLocal = async (login, password) => {
    const users = await getUsers()
    
    let userLogged = users.filter((user) => {
        if(login === user.login && password === user.password) return user
    })
    localStorage.setItem('user', JSON.stringify(userLogged[0]))
}

const setSeason = async (login, password) => {
    const users = await getUsers()
    
    let userLogged = users.filter((user) => {
        if(login === user.login && password === user.password) return user
    })
    seasonStorage.setItem('user', JSON.stringify(userLogged[0]))
}

/* Global consts */
const formNewTask = document.getElementById('formNewTask')

let ordering = true
let contrast = localStorage.getItem("contrast")
let currentTask = null
let currentPage = 1
let currentUser = 1// Jessica Account

const NUM_EMPTY = 'Insira um número.'
const DESCRIPTION_EMPTY = 'Insira uma descrição.'
const DATE_EMPTY = 'Escolha uma data.'
const STATUS_EMPTY= 'Escolha um status.'

const footerHelp = document.getElementById('footerHelp')
const modalHelpUser = document.getElementById('modalHelpContent')

const modalNewTask = document.getElementById('modalNewTaskContent')
const modalEditUser = document.getElementById('modalEditContent')
const modalInfoConf = document.getElementById('modalInfoContent')

const searchInput = document.getElementById('searchField')

const inDate = new Date()
const inDay = inDate.toLocaleDateString("pt-BR")
const inToday = `${inDate.getFullYear()}-${(inDate.getMonth())+1}-${inDate.getDate()}`
const modalLogin = document.getElementById('modalLogin')
const modalRegistration = document.getElementById('modalRegistration')
const modalInfo = document.getElementById('modalInfo')

const loginInput = document.getElementById('nameLogin')
const passwordInput = document.getElementById('passwordLogin')

const modalError = document.getElementById('modalError')

const formReg = document.getElementById('formReg')
const formLogin = document.getElementById('formLogin')

const modalErrorTxt = document.getElementById('modalErrorTxt')

/* MODAL'S FUNCTIONS */

const openModal = (idModal) => {
    const modal = document.getElementById(idModal)
    modal.style.display = 'block'
}

const closeModal = (idModal) => {
    const modal = document.getElementById(idModal)
    modal.style.display = 'none'
}

/* TASKS' FUNCTIONS SECTION */
const renderTasks = (tasks) => {
    const tasksContent = document.getElementById('tbody-content')
    tasksContent.innerHTML = ''
    tasks.forEach((task) => {
        const date = new Date(task.date)
        const dateFormated = date.toLocaleDateString("pt-BR", {timeZone: 'UTC'})
        /* const status = task.status
        const classStatus = status.replace(" ", "-") */
        if(task.status === 'Concluído'){
            task.description = `<del>${task.description}</del>`
        } else if(inDay > dateFormated && task.status !== 'Concluído'){
            task.status = 'Atrasado'
            warningLateTask()
        }
        tasksContent.innerHTML = tasksContent.innerHTML + `<tr>
        <td>${task.number}</td>
        <td>${task.description}</td>
        <td>${dateFormated}</td>
        <td class="${(task.status).replace(" ", "-")}">${task.status}</td>
        <td>
          <span><i class="fa-solid fa-pen-to-square iconTable fa-xl" onclick="editTask(${task.id})"></i>
          </span>
          <span><i class="fa-solid fa-trash iconTable fa-xl" onclick="confirmDelete(${task.id})"></i>
          </span>
        </td>
      </tr>`
    })
}

const confirmDelete = (idTask) =>{
    openModal('modalConfirmation')

    const deleteTask = async (id) => {
        await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE'
    })
    }
    const button = document.getElementById('buttonYes')
    button.addEventListener('click', () => {
    deleteTask(idTask)
})
}

const deleteTask = async (id) => {
    await fetch(`http://localhost:3000/tasks/${id}`, {
    method: 'DELETE'
})
}

const getTasksRender = async () => {
    const tasksResponse = await fetch('http://localhost:3000/tasks?_limit=10')//
    const tasks = await tasksResponse.json()
    renderTasks(tasks)
}

const getTasksReturn = async () => {// decrease the number of API requests with this function
    const tasksResponse = await fetch('http://localhost:3000/tasks')//
    const tasks = await tasksResponse.json()
    return tasks
}

const getTask = async (id) => {
    const taskResponse = await fetch(`http://localhost:3000/tasks/${id}`)
    const task = await taskResponse.json()
    return task
}
const newTask = async (task) => {
    await fetch('http://localhost:3000/tasks', {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    })
}

const clearModalNewTask = () => {
    const numberField = document.getElementById('number')
    const descriptionField = document.getElementById('description')
    const dateField = document.getElementById('date')
    const select = document.querySelector('#selectStatus');

    numberField.value = ''
    descriptionField.value = ''
    dateField.value = ''

    select.options[0].selected = true
}

//KEEP WORKIN ON THIS FUNCTION

const numberSugestion = async () => {
    const numberSugestion = document.getElementById('numberSugestion')
    const tasks = await getTasksReturn()
    let numbers = []
    
    const numTasks = tasks.map((obj) => obj.number)
    const numbersSorted = numTasks.sort(function(a, b) {
        return a - b;// use this in the sorting tasks
      })

    for(let counter = 0; counter < numbersSorted.length; counter++){
      if(numbersSorted[counter] !== counter) numbers.push(counter)
    }
    //numberSugestion.innerHTML = 1

    console.log(numbersSorted)
    console.log(numbers)
    //console.log(numbers[0])
  //note to the future Me: The problem of this function is that it's limited by the array.length, but for my needs right now it will fit =/
  }

const saveTask = async (task) => {
    if(currentTask === null){
        await newTask(task)
    } else {
        await updateTask(currentTask.id, task)
        currentTask = null
    }
    closeModal('modalNewTask')
}
const updateTask = async (id, task) => {
    await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    })
}
const editTask = async (id) => {

    const numberField = document.getElementById('number')
    const descriptionField = document.getElementById('description')
    const dateField = document.getElementById('date')

    currentTask = await getTask(id) 

    openModal('modalNewTask')

    numberField.value = currentTask.number
    descriptionField.value = currentTask.description
    dateField.value = currentTask.date

    let text = currentTask.status
    let select = document.querySelector('#selectStatus');

    for (let counter = 0; counter < select.options.length; counter++) {
        if (select.options[counter].text === text) {
            select.options[counter].selected = true
        }
    }

    const button = document.getElementById('submitButton')
    button.innerHTML = 'Alterar'
}

class Task {
    number
    description
    date
    status
    constructor(number, description, date, status) {
        this.number = number
        this.description = description
        this.date = date
        this.status = status
    }
}

//const button = document.getElementById('submitButton')
console.log(formNewTask)
const formTaskNew = document.querySelector('#formNewTask')
console.log(formTaskNew)

formNewTask.addEventListener('submit', (event) => {
    event.preventDefault()

    const number = formNewTask.elements['number'].value
    const description = formNewTask.elements['description'].value
    const date = formNewTask.elements['date'].value
    const status = formNewTask.elements['status'].value

    const num = Number(number)

    const task = new Task(num, description, date, status)
    saveTask(task)
})

 /* formNewTask.addEventListener('onchange', (event) => {
    event.preventDefault()

    const button = document.getElementById('submitButton')

    const number = formNewTask.elements['number']
    const description = formNewTask.elements['description']
    const date = formNewTask.elements['date']
    const status = formNewTask.elements['status']

    const task = new Task(number, description, date, status)

    const numberValid = hasValue(number, NUM_EMPTY)
    const descriptionValid = hasValue(description, DESCRIPTION_EMPTY)
    const dateValid = hasValue(date, DATE_EMPTY)
    const statusValid = hasValue(status, STATUS_EMPTY) 

    if(numberValid && descriptionValid && dateValid && statusValid) {
        button.disabled = false
        button.className = 'enabled'
        saveTask(task)
    }
}) */

function showMessage(input, message, type) {
    const msg = input.parentNode.querySelector('small')
    msg.innerText = message
    input.className = `${input.className} ${type ? 'success' : 'error'}`
    return type
}

function showError(input, message) {
    return showMessage(input, message, false)
}

function showSuccess(input) {
    return showMessage(input, '', true)
}

function hasValue(input, message) {
    if(input.value.trim() === '' || input.value === 'Escolha uma opção') {
        return showError(input, message)
    } else{
        return showSuccess(input)
    }
}

/* PAGING FUNCTIONS */

const loadPage = async (pageNum) => {
    const tasksResponse = await fetch(`http://localhost:3000/tasks?_limit=10&_page=${pageNum}`)//
    const tasks = await tasksResponse.json()
    renderTasks(tasks)
}

const nextPage = async () => {
    const tasks = await getTasksReturn()
    let pagesTotal = Math.ceil(tasks.length / 10)

    currentPage = currentPage + 1 > pagesTotal ? currentPage : currentPage + 1
    
    currentPageNum(currentPage)
    loadPage(currentPage)
}

const nextPageButton = document.getElementById('nextPage')

nextPageButton.addEventListener('click', () => {
    nextPage()
})

const previousPage = async () => {
    currentPage = currentPage - 1 < 1 ? 1 : currentPage - 1
    
    currentPageNum(currentPage)
    loadPage(currentPage)
}

const currentPageNum = (page) => {
const spanPage = document.getElementById('currentPage')
spanPage.innerHTML = `${page}`
}

const tasksPagesTotal = async () => {
    const pagesLength = document.getElementById('pagesLength')

    const tasks = await getTasksReturn()
    let pagesTotal = Math.ceil(tasks.length / 10)
    
    pagesLength.innerHTML = pagesTotal
}

/* FIELDS VERIFICATION FUNCTIONS */



/* SORTING FUNCTION */

const orderingTable = async (key) => {

    if(ordering) {
        const ascMode = await fetch(`http://localhost:3000/tasks?_limit=10&_sort=${key}&_order=asc`)
        const ascTasks = await ascMode.json()
        renderTasks(ascTasks)
        ordering = false
    }else{
        const descMode = await fetch(`http://localhost:3000/tasks?_limit=10&_sort=${key}&_order=desc`)
        const descTasks = await descMode.json()
        renderTasks(descTasks)
        ordering = true
    }
}

/* LIGHT MODE / DARK MODE */

const background = document.getElementById('div-white')
const iconButton = document.getElementById('iconMode')
const buttonBack = document.getElementById('darkModeContent')
const logo = document.getElementById('logoArnia')
const tableBody = document.getElementById('tbody-content')
const header = document.getElementById('headerSection')
const divPurple = document.getElementById('div-purple')
const divGray = document.getElementById('div-grey')
const divOrange = document.getElementById('div-orange')
const buttonsPaging = document.getElementById('buttonsPaging')
const selectStatus = document.getElementById('selectStatus')
const buttons = document.querySelectorAll("button")
const modals = document.getElementsByClassName('classModal')
const inputs = document.querySelectorAll("input")
const helpTitle = document.getElementById('helpTitle')
const searchField = document.getElementById('searchField')
const deleteAccountBtn = document.getElementById('deleteAccountButton')

const switchMode = () => {
    let dark = ''
    let light = 'light'
    
    if(contrast) {
        lightMode()
        contrast = dark
        localStorage.setItem("contrast", light)
    }else {
        darkMode()
        localStorage.setItem("contrast", dark)
        contrast = light
    }
}

contrast = localStorage.getItem("contrast")

/* buttonBack.addEventListener('click', () => {
    switchMode()
}) *///This is double clicking the switchMode!!! Fix this...

const lightMode = () => {   
    background.style.backgroundColor = 'var(--background)'

    iconButton.src = "../assets/moon.svg"
    buttonBack.style.backgroundColor = 'var(--purple)'
    
    logo.src = '../assets/logo-purple.svg'
    
    tableBody.className = 'table-light text-purple'
    
    tHead.style.color = 'var(--darkpurple)'
    tHead.className = 'font-weight-bold table-light'    
    
    header.style.color = 'var(--purple)'

    divPurple.style.backgroundColor = 'var(--purple)'
    divGray.style.backgroundColor = 'var(--lightpurple)'
    divOrange.style.backgroundColor = 'var(--yellow)'

    buttonsPaging.style.color = 'var(--indigo)'
    
    footerHelp.className = ''
    
    for(let counter = 0; counter < buttons.length; counter++){
        buttons[counter].className = 'light-button'
    }

    for (let counter = 0; counter < modals.length; counter++) {
        modals[counter].className = 'classModal modalBack-light downToUpAnimation'  
    }

    for (let counter = 0; counter < modals.length; counter++) {
        inputs[counter].style.backgroundColor = 'var(--background)'  
    }

    selectStatus.style.backgroundColor = 'var(--background)'

    searchField.style.backgroundColor = ''

    helpTitle.style.color = 'var(--purple)'

    deleteAccountBtn.className = 'deleteAccount'
}

const darkMode = () => {
    background.style.backgroundColor = 'var(--darkBackground)'

    iconButton.src = "../assets/sun.svg"
    buttonBack.style.backgroundColor = 'var(--darkorange)'
    
    logo.src = '../assets/logo.png'
    
    tableBody.className = 'table-dark text-white'
    
    tHead.style.color = 'white'
    tHead.className = 'font-weight-bold table-dark'
    
    header.style.color = 'var(--darkWhite)'
    //var(--background)
    
    divPurple.style.backgroundColor = 'var(--darkpurple)'
    divGray.style.backgroundColor = 'var(--purpleple)'
    divOrange.style.backgroundColor = 'var(--darkorange)'

    buttonsPaging.style.color = 'var(--background)'

    footerHelp.className = 'dark-footer'
    
    for(let counter = 0; counter < buttons.length; counter++){
        buttons[counter].className = 'dark-button'
    }

    for (let counter = 0; counter < modals.length; counter++) {
        modals[counter].className = 'classModal modalBack-dark text-purple downToUpAnimation'  
    }

    for (let counter = 0; counter < modals.length; counter++) {
        inputs[counter].style.backgroundColor = 'var(--greypurple)'
    }

    selectStatus.style.backgroundColor = 'var(--greypurple)'

    searchField.style.backgroundColor = 'var(--darkpurple)'

    helpTitle.style.color = 'var(--yellow)'

    deleteAccountBtn.className = 'deleteAccount'
}

/* SEASON/LOCALE STORAGE FUNCTIONS */

const contrastMode = () => {
    if(contrast) {
        lightMode()
    }else {
        darkMode()
    }
}



/* https://developer.mozilla.org/pt-BR/docs/Web/API/Window/sessionStorage

function doLogin() {
  const keepMeConnected = document.getElementById("keepMeConnected").value

  sessionStorage.setItem("keepMeConnected", keepMeConnected)
}

function checkSession() {
  if (sessionStorage.getItem("keepMeConnected")) {
    // redireciona para a página logada
  }
  //deixa na página de login
}
checkSession está no onload do body da página de login */

/* --------------------------------------------------------- */

/* WEATHER FUNCTIONS */

const weatherSearch = async (user) => {
    const locals = []
    const conditions = []

    locals.push(...(await (await fetch(`http://dataservice.accuweather.com/locations/v1/search?q=${user}&apikey=RTILAUMEASKAhXMGkVLeNniVv3gNmk0k`)).json()))

    const key = locals[0].Key
    conditions.push(...(await (await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${key}?apikey=RTILAUMEASKAhXMGkVLeNniVv3gNmk0k`)).json()))
    return conditions
}

const weatherInfo = async () => {

    const weatherName = document.getElementById('weatherName')
    const weatherCity = document.getElementById('weatherCity')
    const weatherTemp = document.getElementById('weatherTemp')
    //const weatherCond = document.getElementById('weatherCond')

    const user = await getUsers()
    const userIndex = user.findIndex((valor) => {
        if(valor.id === currentUser) return true
    })    
    const userCity = user[userIndex].city
    const userInfoWeather = await weatherSearch(userCity)

    weatherName.innerHTML = `${user[userIndex].name}`
    weatherCity.innerHTML = `${userCity}`
    weatherTemp.innerHTML = `${userInfoWeather[0].Temperature.Metric.Value}°C`
    //weatherCond.innerHTML = `${userInfoWeather[0].WeatherText}`

}//turn weather.text off

/* FILTER TASKS FUNCTIONS */

const filterTasks = async (status) => {
    const tasks = await getTasksReturn()
    const filterTasks = tasks.filter((valor) => {
        if(valor.status === status) return true
        return false
    })
    renderTasks(filterTasks)
}

const lateTasks = async () => {
    const tasks = await getTasksReturn()

    const tasksLate = tasks.filter((task) => { 
        const date = new Date(task.date)
        const dateFormated = date.toLocaleDateString("pt-BR", {timeZone: 'UTC'})     
        if(inDay > dateFormated && task.status !== 'Concluído') return true
        return false
    })
    renderTasks(tasksLate)
}

const warningLateTask = () => {
    const button = document.getElementById('btnLate')
    button.className = 'lateTask'
}

const todayTasks = async () => {
    const tasks = await getTasksReturn()

    const tasksToday = tasks.filter((task) => { 
        const date = new Date(task.date)
        const dateFormated = date.toLocaleDateString("pt-BR", {timeZone: 'UTC'})     
        if(dateFormated === inDay && task.status !== 'Concluído') return true
        return false
    })
    renderTasks(tasksToday)
}

searchInput.addEventListener('input', async () => {
    const tasks = await getTasksReturn()
    const input = searchInput.value.toUpperCase();

    let taskSearch = tasks.filter((task) => {
        let search = task.description.toUpperCase()
    if(search.includes(input)) return true
        return false
    })
    renderTasks(taskSearch)
})

/* USER FUNCTIONS */

/* const getUsers = async () => {//put this function in the main.html
    const users = await fetch(`http://localhost:3000/users`)
    const usersResponse = await users.json()
    return usersResponse
} */

const getUser = async () => {
    const userResponse = await fetch(`http://localhost:3000/users/${currentUser}`)
    const user = await userResponse.json()
    return user
}

const updateUser = async (id, user) => {
    await fetch(`http://localhost:3000/users/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
}

const confirmEditUser = async () => {//how i'm going to make this function work?

    const editButton = document.getElementById('editButton')
    const msgModalInfo = document.getElementById('textModalInfo') 

    const currentUserObj = await getUser(currentUser)
    editButton.addEventListener('click', () => {
        if(confirmInput.value !== currentUserObj.password){
            openModal('modalInfo')
            msgModalInfo.innerHTML = 'Ocorreu um erro'
        }else{
            closeModal('modalEditConfirm')
            editUser(currentUser)
            editInput.value = ''
        }
    })
}

//vou parar isso um pouquinho. Cabeça on fire

const editUser = async (id) => {
    openModal('modalEditInfo')
    const currentUserObj = await getUser(id)

    const name = document.getElementById('name')
    const city = document.getElementById('city')
    const login = document.getElementById('login')
    const email = document.getElementById('email')
    const password = document.getElementById('password')

    name.value = currentUserObj.name
    city.value = currentUserObj.city
    login.value = currentUserObj.login
    email.value = currentUserObj.email
    password.value = currentUserObj.password

    await updateUser(id, currentUserObj)
    openModal('modalInfo')
    closeModal('modalEditInfo')
}

const confirmDeleteUser = async () =>{
    closeModal('modalHelp')
    openModal('modalDeleteConfirm')

    const button = document.getElementById('deleteButton')
    const passwordInput = document.getElementById('passConfirmDelete')
    const msg = passwordInput.parentNode.querySelector('small')
    
    const currentUserObj = await getUser(currentUser)

    const deleteUser = async (id) => {
        await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE'
    })
    }

    passwordInput.addEventListener('input', () => {
    if(passwordInput.value.trim() !== currentUserObj.password){
        msg.innerHTML = 'Senha incorreta'
        passwordInput.className = 'error'
    }else{
        passwordInput.className = 'success'
        msg.innerHTML = ''
    }
    button.addEventListener('click', () => {
        if(passwordInput.value.trim() === currentUserObj.password){
            deleteUser(currentUser)
            window.location.href = '../login-page/index.html'
        }else{
            msg.innerHTML = 'Preencha esse campo corretamente'
            passwordInput.className = 'error'
        }
    })
    //how to delete all the tasks from the user account?
})
}

const loadBody = () => {
    getTasksRender(); 
    weatherInfo(); 
    tasksPagesTotal(); 
    currentPageNum(1); 
    contrastMode()
}

/* =================================================================== */
/* INDEX FUNCTIONS */
/* =================================================================== */

/* Global Consts */



/* ------------------------------- */

/* Functions Modals */

/* const openModal = (idModal) => {
    const modal = document.getElementById(idModal)
    modal.style.display = 'block'
}

const closeModal = (idModal) => {
    const modal = document.getElementById(idModal)
    modal.style.display = 'none'
}  */

/* Creating a new User */

const newUser = async (user) => {
    await fetch('http://localhost:3000/users', {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then( () => {
        modalInfo.style.display = 'block'
        modalRegistration.style.display = 'none'
    })
    .catch(
        (error) => {
        modalRegistration.style.display = 'none'
        modalError.style.display = 'block'
        modalErrorTxt.innerHTML = "Erro:" + error
    })
}

class User {
    name
    city
    login
    email
    password
    constructor(name, city, login, email, password) {
        this.name = name
        this.city = city
        this.login = login
        this.email = email
        this.password = password
    }
}

formReg.addEventListener("submit", (event) => {
    event.preventDefault()

    let name = formReg.elements['name'].value
    let city = formReg.elements['city'].value
    let login = formReg.elements['login'].value
    let email = formReg.elements['email'].value
    let password = formReg.elements['password'].value
    
    let user = new User(name, city, login, email, password)
    newUser(user)
})

/* Making Login Possible */

/* const getUsers = async () => {//put this function in the main.html
    const users = await fetch(`http://localhost:3000/users`)
    const usersResponse = await users.json()
    return usersResponse
} */

/* const loginUser = async (login, password) => {
    const users = await getUsers()
    const findUserLogin = await users.find(user => {
        return login.value == user.login
    })  
    const findUserPass = await users.find(user => {
        return password.value == user.password
    })
    if (findUserLogin && findUserPass){
        window.location.href = '../tasks-page/main.html'
    } else{
        modalError.style.display = 'block'
    }
} */
const findUser = async (login, password) => {
    const users = await getUsers()
    const findUserLogin = await users.find(user => {
        return login.value === user.login
    })  
    const findUserPass = await users.find(user => {
        return password.value === user.password
    })
    if(findUserLogin && findUserPass) return true
}

formLogin.addEventListener('change', (event) => {
    event.preventDefault()

    let login = formLogin.elements['nameLogin']
    let password = formLogin.elements['passwordLogin']
    let checkbox = formLogin.elements['signIn'].checked

    login.className = 'success'
    const userFound = findUser(login, password)
    console.log(userFound)
    if (userFound) {
        window.location.href = '../tasks-page/main.html'
        if(checkbox){
            setLocal(login, password)
        } else{
            setSeason(login, password)
        }
    } else{
        modalError.style.display = 'block'
    }
    
})

/* Fields Verification */

const NAME_REQUIRED = 'Por favor, insira o seu nome'
const CITY_REQUIRED = 'Por favor, insira o sua cidade'
const LOGIN_REQUIRED = 'Por favor, insira um login'
const EMAIL_REQUIRED = 'Por favor, insira um email'
const PASS_REQUIRED = 'Por favor insira sua senha'

const deleteUser = async (id) => {
    await fetch(`http://localhost:3000/users/${id}`, {
    method: 'DELETE'
})
}