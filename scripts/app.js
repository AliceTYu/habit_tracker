'use strict'

let habbits = [{
        "id": 1,
        "icon": "sport",
        "name": "Отжимания",
        "target": 10,
        "days": [
            {"comment": "Первый подход всегда тяжело"},
            {"comment": "Второй уже легче"}
        ]
    },{
        "id": 2,
        "icon": "water",
        "name": "Вода",
        "target": 3,
        "days": [
            {"comment": "Пью 1ый день - 1л."},
            {"comment": "2л."},
            {"comment": "1.5л."}
        ]
    }]
const HABIT_KEY = 'HABIT_KEY'
let globalActiveHabbitId
let task

/* page */
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.title'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
        dayContainer: document.querySelector('.block'),
        nextDay: document.querySelector('.habbit__day')
    },
    popup: document.querySelector('.cover'),
    iconField: document.querySelector('.popup__form input[name="icon"]')
}

/* utils */
function loadData() {
    const habbitString = localStorage.getItem(HABIT_KEY)
    const habbitArray = JSON.parse(habbitString)
    if (Array.isArray(habbitArray)){
        habbits = habbitArray
    }
}

function saveData() {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habbits))
}

function togglePopup(){
    if (page.popup.classList.contains('cover_hidden')){
        page.popup.classList.remove('cover_hidden') 
    } else {
        page.popup.classList.add('cover_hidden') 
    }
    
}

function resetForm(form, fields){
    for (const field of fields){
        form[field].value = ''
    }
}

function validateAndGetForm(form, fields){
    const formData = new FormData(form)
    const res = {}
    for (const field of fields){
        const fieldValue = formData.get(field) //получаем значение поля с указанным именем
        form[field].classList.remove('error')
        if (!fieldValue){
            form[field].classList.add('error')
        }
        res[field] = fieldValue
    }
    let isValid = true
    for (const field of fields){
        if (!res[field]){
            isValid = false
        }
    }
    if (!isValid){
        return
    }
    return res
}

/* render */
function rerenderMenu(activeHabbit){
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`)
        if (!existed){
            // создание
            const element = document.createElement('button')
            element.setAttribute('menu-habbit-id', habbit.id)
            element.classList.add('menu__item')
            element.addEventListener('click', () => {rerender(habbit.id)})
            element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`

            if (activeHabbit.id === habbit.id){
                element.classList.add('menu__item_active')
            }

            page.menu.appendChild(element)

            continue
        }

        if (task == 'delete'){
            const del = document.querySelector(`[menu-habbit-id="${habbit.id}"]`)
            del.remove();
            task = null
        }

        if (activeHabbit.id === habbit.id){
            existed.classList.add('menu__item_active')
        } else {
            existed.classList.remove('menu__item_active')
        }
    }
}

function rerenderHeader(activeHabbit){
    page.header.h1.innerText = activeHabbit.name
    const progress = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100
    page.header.progressPercent.innerText = progress.toFixed(0) + '%'
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`)
}

const add_btn = document.querySelector('.habbit')
function rerenderComment(activeHabbit){
    page.content.dayContainer.innerHTML = ''
    for (const index in activeHabbit.days){
        if (Number(activeHabbit.target) <= Number(index) + 1){
            add_btn.style.display = 'none'
            const element = document.createElement('div')
            element.classList.add('habbit')
            element.innerHTML = `
                <div class="habbit__day">День ${Number(index) + 1}</div>
                <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
                <button class="habbit__delete" onclick="removeDays(${index})">
                    <img src="./images/del.svg" alt="Удалить день ${index + 1}" />
                </button>
            `
            page.content.dayContainer.appendChild(element)
        } else {
            add_btn.style.display = 'flex'
            const element = document.createElement('div')
            element.classList.add('habbit')
            element.innerHTML = `
                <div class="habbit__day">День ${Number(index) + 1}</div>
                <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
                <button class="habbit__delete" onclick="removeDays(${index})">
                    <img src="./images/del.svg" alt="Удалить день ${index + 1}" />
                </button>
            `
            page.content.dayContainer.appendChild(element)
        }
    }
    page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`
}

function rerender(activeHabbitId){
    globalActiveHabbitId = activeHabbitId
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId)

    if(!activeHabbit){
        return
    }

    rerenderMenu(activeHabbit)
    rerenderHeader(activeHabbit)
    rerenderComment(activeHabbit)
}

/* work with days */
function addDays(event){
    event.preventDefault()
    
    const data = validateAndGetForm(event.target, ['comment'])
    if (!data){
        return
    }
    habbits = habbits.map((habbit) => {
        if (habbit.id === globalActiveHabbitId){
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            }
        }
        return habbit
    })
    resetForm(event.target, ['comment'])
    rerender(globalActiveHabbitId)
    saveData()
    
}

function removeDays(index){
    habbits = habbits.map((habbit) => {
        if (habbit.id === globalActiveHabbitId){
            habbit.days.splice(index, 1)
            return {
                ...habbit,
                days: habbit.days
            }
        }
        return habbit
    })
    rerender(globalActiveHabbitId)
    saveData()
}

function addHabbit(event){
    event.preventDefault()
    
    const data = validateAndGetForm(event.target, ['name', 'icon', 'target'])
    if (!data){
        return
    }
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    })
    resetForm(event.target, ['name', 'target'])
    togglePopup()
    rerender(maxId + 1)
    saveData()
}

function deleteTask(){
    const index = habbits.filter(n => n.id == globalActiveHabbitId)
    // console.log(index)
    // const habbit = habbits.slice(index, 1)
    // return habbit
    
    habbits = habbits.map((habbit) => {
        console.log('index')
        console.log(index.id)
        console.log(habbit)
        console.log(habbit.id)
        if (habbit.id == globalActiveHabbitId){
            habbits.slice(index, 1)
            console.log(habbits)
            return habbits
        }
    })

    // if (habbit !== -1) {
    //     habbits.splice(habbit, 1);
    // }
    // task = 'delete'
    // console.log(habbits)
    // console.log(habbit)
    // console.log(globalActiveHabbitId)
    
    // rerender(globalActiveHabbitId)
    // saveData()
}

/* working with habbits */
function setIcon(context, icon){
    page.iconField.value = icon
    const activeIcon = document.querySelector('.icon.icon_active')
    activeIcon.classList.remove('icon_active')
    context.classList.add('icon_active')
}

/* utils */
(() => {
    loadData()
    rerender(habbits[0].id)
})()





