// 'use strict';
/*
 * Before start chatting you need to follow this steps:
 * 1. Initialize QB SDK ( QB.init() ); 
 * 2. Create user session (QB.createSession());
 * 3. Connect to the chat in the create session callback (QB.chat.connect());
 * 4. Set listeners;
 */


function App(config) {
    init(config)
}
// let credentials = {
//     appId: 84216, 
//     authKey: 'g8WcD6YyXrx4UST',
//     authSecret: 'G6ZvHcd3egV-Gkv'
// }

// Target the HTML elemets by their id 
let btn = document.getElementById("send-button")  // Send button 
let inputField = document.getElementById('input-message') // Text input field
let nameBanner = document.getElementById('name-banner') // Name banner in the message container
let container = document.getElementById('message-container') // Message container
let leftSide = document.getElementById('users-list') // Left side User List
let LeftContainer = document.getElementById('left-container') // Left side container
let RightContainer = document.getElementById('right-container') // Right side container
let InitialLoader = document.getElementById('initial-loader') // Initial Loader

// window.onload(()=>{
//     LeftContainer.style.display = "none"
//     RightContainer.style.display = "none"
// })

let admin = {
    adminId: null,
    userId: null,
    currentUserID: null,
    currentDialogue: null,
    selectedUserName: null,
    isOnline: false

}
var user = {
    login: "Coach",
    password: '11223344',
    full_name: "Coach"
};
let userArry = []


var CONFIG = {
    on: {
      sessionExpired: function(handleResponse, retry) {
        // call handleResponse() if you do not want to process a session expiration,
        // so an error will be returned to origin request
        handleResponse();
        
        QB.createSession(function(error, session) {
            console.log(session);
            console.log(retry);
            
            retry(session);
        });
      }
    }
  };




function init(config) {
    QB.init(config.credentials.appId, config.credentials.authKey, config.credentials.authSecret, CONFIG.on);

    createSession()


}



function createSession() {


    QB.createSession(user, function (err, result) {
        // callback function

        if (err) {
            alert("Internal Server Error")

        } else {
            // console.log(this.QB);
            login(user)

        }
    })
}


function login(params) {


    QB.login({
        login: params.login,
        password: params.password
    }, (err, resp) => {

        if (err) {
            // console.log(err);

        } else {
            // console.log(resp);

            let btn = document.getElementById("send-button")
            // btn.setAttribute("data-user_id", resp.id)
            admin.adminId = resp.id // admin id .. mine id...
            if (resp.id) {
                onMsgListener(admin.adminId)
            }
            chatConnect()

        }
    })
}

function chatConnect() {

    QB.chat.connect({ userId: admin.adminId, password: user.password }, function (error, contactList) {

        if (error) {
            alert("Unable to connect with chat server, Please check your internet Connection")

        }
        else {

            // console.log(contactList);
            chatDialogues()
            // listUsers()
        }
    })
}


function chatDialogues() {

    var filters = { "sort_asc": "last_message_date_sent" }
    leftSide.innerHTML = ""
    QB.chat.dialog.list(filters, function (error, dialogs) {
        if (error) {
            // console.log(error);

        }
        else {
            userArry = dialogs.items

            userArry.map((item, key) => {
                // checkOnlineStatus(item._id)
                // console.log(item);


                if (item.last_message) {        // item._id = dialogue id && item.user_id = user id not admin 
                    admin.currentDialogue = item._id
                    admin.currentUserID = item.user_id
                    admin.selectedUserName = item.name


                    return leftSide.innerHTML += `<li class="user"  data-user-id="${item.user_id}" data-dialogue-id="${item._id}" >
                                                        <div class="user-detail" onclick="getUserMsg('${item._id}' , '${item.user_id}' , '${item.name}')" data-user-id="${item.user_id}">
                                                        <div class="image-outer">
                                                            <img src="https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                                                            alt="" class="user-image">
                                                            </div>
                                                            <div class="user-name-outer" id="user-name-outer">
                                                                <div class="user-name" id="user_name_div">
                                                                ${item.name}
                                                                </div>
                                                                <div class="user-message">
                                                                    ${item.last_message.startsWith("http:") || item.last_message.startsWith("https:")

                            ? "Attachment"
                            : item.last_message}
                                                                </div>
                                                                </div>
                                                                <div class="delete_icon" onclick='deleteAllMessages("${item._id}" , "${item.user_id}")' >
                                                                    <img src='images/bin.png' title="Delete"/>
                                                                </div> 
                                                                </div>
                                                                </li>`
                }

            })



            unreadStatusCount()

            getUserMsg(admin.currentDialogue, admin.currentUserID, admin.selectedUserName)
            // checkOnlineStatus(admin.currentDialogue)
        }

    })



}



function getUserMsg(dialogueID, userID, userName) {
    admin.currentDialogue = dialogueID
    admin.currentUserID = userID
    admin.selectedUserName = userName
    nameBanner.innerHTML = userName


    
    var file = document.getElementById("input_files")
    // var inputFile = file.files[0];
    file.File = []
    let inputMsg = document.getElementById("input-message")
    inputMsg.value = ""
    inputMsg.disabled = false

    
    let userList = document.querySelectorAll(".user")

    // Change the message status from unread to read > Section Start

    for (const item of userList) {
        let dialogue = item.dataset.userId
        if (dialogue === admin.currentUserID) {
            let msgDiv = item.getElementsByClassName("user-message")
            msgDiv[0].style.fontWeight = 'normal'
            msgDiv[0].style.fontStyle = "14px"

            let unreadMsg = item.querySelector("#unread-msg-count")
            // console.log(unreadMsg);
            if (unreadMsg) {
                unreadMsg.remove()
            }


        }

    }






    userList.forEach(element => {
        let selectedUser = element.getAttribute("data-user-id")

        element.classList.remove("selected-indicator")
        if (selectedUser == userID) {
            // console.log(element.children[0]);
            element.classList.add("selected-indicator")

        }

    });

    // checkOnlineStatus(admin.currentDialogue)
    getUserById()



    var params = {
        chat_dialog_id: dialogueID,
        sort_desc: 'date_sent',
        limit: 100,
        skip: 0
    };
    let container = document.getElementById('message-container')


    container.innerHTML = ` <div class="loader">
                                <p>Loading Chat...</p>
                                <img src="https://i.ya-webdesign.com/images/loading-png-gif.gif" alt="">
                            </div>`



    QB.chat.message.list(params, function (error, messages) {
        if (error) {
            // console.log(error);

        } else {
            container.innerHTML = ""
            // console.log(messages);
            // let lastInd = messages.items.length
            let userArray = document.querySelectorAll(".user")

            // for (const item of userArray) {
            //     let dialogue = item.dataset.userId
            //     if (dialogue == messages.items.sender_id) {
            //         let msgDiv = item.getElementsByClassName("user-message")
            //         let txtMsg = msgDiv[0].childNodes[0]
            //         let txtNode = document.createTextNode(msg.body)
            //         txtMsg.remove()
            //         msgDiv[0].appendChild(txtNode)
            //     }


            // }
            messages.items.map((item, key) => {






                if (item.message) {
                    if (item.sender_id == admin.currentUserID) {


                        var fileUrl
                        var imageHTML
                        if (item.attachments.length > 0) {
                            var fileUID = item.attachments[0].uid;
                            fileUrl = QB.content.privateUrl(fileUID);
                            // var fileUrl = QB.content.publicUrl(fileUID); - content create and upload param 'public' = true
                            imageHTML = "<img src='" + fileUrl + "' alt='photo'/>";

                        }


                        return container.innerHTML += `<div class="mine-messages message-box" id="mine-message" data-msg-id="${item._id}">
                                                            <div class="image-outer">
                                                                <img src="https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg" alt=""
                                                                class="user-pic">
                                                            </div>
                                                            ${ item.message.startsWith("https:") || item.message.startsWith("http:") ?
                                `<div class="mine-message-box">
                                                                            <div class="type-message">
                                                                            <img src=${item.message} alt='photo'/>
                                                                                                </div>
                                                                                                </div>`

                                :
                                `<div class="mine-message-box">
                                                                            <div class="type-message">
                                                                            ${ item.message}
                                                                            </div>
                                                                        </div>`
                            }
                                                                    <div class="delete_icon" onclick='deleteOneMsg("${item._id}")' >
                                                                    <img src='images/bin.png' title="Delete"/>
                                                                    </div>
                                                                    <div class="time-chat-incoming" data-msg-id="${item._id}">
                                                                    ${item.created_at.slice(11, 16)}
                                                                    </div>
                                    </div>
                        `
                    }
                    else {
                        var fileUrl
                        var imageHTML
                        if (item.attachments.length > 0) {
                            var fileUID = item.attachments[0].uid;
                            fileUrl = QB.content.privateUrl(fileUID);
                            // var fileUrl = QB.content.publicUrl(fileUID); - content create and upload param 'public' = true
                            imageHTML = "<img src='" + fileUrl + "' alt='photo'/>";

                        }
                        return container.innerHTML += `<div class="your-messages message-box" data-msg-id="${item._id}">
                    <div class="image-outer">
                                                            <img src="https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg" alt=""
                                                                class="user-pic">
                                                                </div>
                                                        ${ item.message.startsWith("https:") || item.message.startsWith("http:") ?
                                `<div class="mine-message-box">
                                                <div class="type-message">
                                                <img src=${item.message} alt='photo'/>
                                                                    </div>
                                                                    </div>`

                                :
                                `
                                                                    <div class="mine-message-box">
                                                                    <div class="type-message">
                                                                            ${item.message}
                                                                        </div>
                                                                        </div>
                                                                        `
                            }
                                                    <div class="delete_icon" onclick='deleteOneMsg("${item._id}")' >
                                                                    <img src='images/bin.png' title="Delete"/>
                                                                    </div>
                                                                    <div class="time-chat-sending" data-msg-id="${item._id}" id="time-chat">
                                                                    ${item.created_at.slice(11, 16)}
                                                                    </div>
                                                    </div>`

                    }
                }
            })
            InitialLoader.style.display = "none"
            LeftContainer.style.display = "inherit"
            RightContainer.style.display = "inherit"
        }

    });
}


btn.addEventListener('click', function () {


    let dialog_id = admin.currentDialogue // dialog id of the user
    let _userID = admin.currentUserID   // message reciever id // customer id
    let userArray = document.querySelectorAll(".user")

    var file = document.getElementById("input_files")
    var inputFile = file.files[0];
    let fileInput = document.getElementById("input-message")



    if (inputFile) {

        var params = { name: inputFile.name, file: inputFile, type: inputFile.type, size: inputFile.size, 'public': false };


        QB.content.createAndUpload(params, function (err, res) {
            if (err) {
                console.error(err);
            } else {
                var fileUID = res.uid;

                // prepare a message
                let fileUrl = QB.content.privateUrl(fileUID);
                console.log(fileUrl);
                var msg = {
                    type: 'chat',
                    body: fileUrl,
                    extension: {
                        save_to_history: 1,
                        attachments: [{ uid: fileUID, type: 'photo' }],
                        dialog_id: admin.currentDialogue
                    },
                    markable: 1
                };

                var msgSenderID = parseInt(admin.currentUserID);
                inputField.value = ""
                msg.id = QB.chat.send(msgSenderID, msg);

                fileInput.value = ""
                file
                fileInput.disabled = false


                if (msg.id) {
                    let div = document.createElement('div')
                    div.classList.add("your-messages", "message-box")
                    let div2 = document.createElement("div")
                    div2.classList.add("image-outer")
                    let img = document.createElement("img")
                    img.src = "https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                    img.classList.add("user-pic")
                    div2.appendChild(img)
                    let div3 = document.createElement("div")
                    div3.classList.add('mine-message-box')
                    let div4 = document.createElement("div")
                    div4.classList.add('type-message')
                    let img2 = document.createElement("img")
                    img2.src = fileUrl
                    div4.appendChild(img2)
                    div3.appendChild(div4)
                    div.appendChild(div2)
                    div.appendChild(div3)

                    let div_del = document.createElement("div")
                    div_del.classList.add("delete_icon")
                    div_del.setAttribute('onclick', `deleteOneMsg("${msg.id}")`)
                    let img_del = document.createElement("img")
                    img_del.src = "images/bin.png"
                    img_del.title = "Delete"
                    div_del.appendChild(img_del)
                    div.appendChild(div_del)

                    let divTime = document.createElement("div")
                    divTime.classList.add("time-chat-sending")
                    let timeTxt = document.createTextNode(new Date().getHours() + ":" + new Date().getMinutes())
                    divTime.appendChild(timeTxt)
                    div.appendChild(divTime)
                    // container.insertBefore(divTime, container.childNodes[0])
                    container.insertBefore(div, container.childNodes[0])

                    // console.log(_userID, msg);

                    for (const item of userArray) {
                        let dialogue = item.dataset.userId
                        if (dialogue == _userID) {
                            let msgDiv = item.getElementsByClassName("user-message")
                            let txtMsg = msgDiv[0].childNodes[0]
                            let txtNode = document.createTextNode("Attachment")

                            txtMsg.remove()
                            msgDiv[0].appendChild(txtNode)
                            userArray.forEach((item, key) => {
                                let value = item.getAttribute('data-user-id')
                                if (value == _userID) {
                                    item.remove()
                                    leftSide.appendChild(item)

                                }

                            })


                        }


                    }
                }
                // return true
            }




        }
        )
    }
    else {
        if (inputField.value.length > 0) {

            let msg = {
                type: 'chat',
                body: inputField.value,
                extension: {
                    save_to_history: 1,
                    dialog_id: admin.currentDialogue
                },
                markable: 1
            };
            var msgSenderID = parseInt(admin.currentUserID);
            inputField.value = ""
            msg.id = QB.chat.send(msgSenderID, msg);

            if (msg.id) {
                let div = document.createElement('div')
                div.classList.add("your-messages", "message-box")
                let div2 = document.createElement("div")
                div2.classList.add("image-outer")
                let img = document.createElement("img")
                img.src = "https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                img.classList.add("user-pic")
                div2.appendChild(img)
                let div3 = document.createElement("div")
                div3.classList.add('mine-message-box')
                let div4 = document.createElement("div")
                div4.classList.add('type-message')
                let div4TxtNode = document.createTextNode(msg.body)
                div4.appendChild(div4TxtNode)
                div3.appendChild(div4)
                div.appendChild(div2)
                div.appendChild(div3)

                let div_del = document.createElement("div")
                div_del.classList.add("delete_icon")
                div_del.setAttribute('onclick', `deleteOneMsg("${msg.id}")`)
                let img_del = document.createElement("img")
                img_del.src = "images/bin.png"
                img_del.title = "Delete"
                div_del.appendChild(img_del)
                div.appendChild(div_del)

                // <div class="delete_icon" onclick='deleteOneMsg("${item._id}")' >
                // <img src='images/bin.png' title="Delete"/>
                // </div>



                let divTime = document.createElement("div")
                divTime.classList.add("time-chat-sending")
                let timeTxt = document.createTextNode(new Date().getHours() + ":" + new Date().getMinutes())
                divTime.appendChild(timeTxt)
                div.appendChild(divTime)
                // container.insertBefore(divTime, container.childNodes[0])
                container.insertBefore(div, container.childNodes[0])

                // console.log(_userID, msg);

                for (const item of userArray) {
                    let dialogue = item.dataset.userId
                    if (dialogue == _userID) {
                        let msgDiv = item.getElementsByClassName("user-message")
                        let txtMsg = msgDiv[0].childNodes[0]
                        let txtNode = document.createTextNode(msg.body)
                        txtMsg.remove()
                        msgDiv[0].appendChild(txtNode)
                        userArray.forEach((item, key) => {
                            let value = item.getAttribute('data-user-id')
                            if (value == _userID) {
                                item.remove()
                                leftSide.appendChild(item)

                            }

                        })


                    }


                }
            }

        }
    }
})

inputField.addEventListener('keypress', function (e) {

    // console.log(e.keyCode);
    let enter = false
    if (e.keyCode == 13) {
        enter = true
    }
    let userArray = document.querySelectorAll(".user")
    var file = document.getElementById("input_files")
    var inputFile = file.files[0];

    let dialog_id = admin.currentDialogue // dialog id of the user
    let _userID = admin.currentUserID   // message reciever id // customer id

    

    if (enter) {


        if (inputFile) {

            var params = { name: inputFile.name, file: inputFile, type: inputFile.type, size: inputFile.size, 'public': false };


            QB.content.createAndUpload(params, function (err, res) {
                if (err) {
                    console.error(err);
                } else {
                    var fileUID = res.uid;

                    // prepare a message
                    let fileUrl = QB.content.privateUrl(fileUID);
                    console.log(fileUrl);
                    var msg = {
                        type: 'chat',
                        body: fileUrl,
                        extension: {
                            save_to_history: 1,
                            attachments: [{ uid: fileUID, type: 'photo' }],
                            dialog_id: admin.currentDialogue
                        },
                        markable: 1
                    };

                    var msgSenderID = parseInt(admin.currentUserID);
                    inputField.value = ""
                    msg.id = QB.chat.send(msgSenderID, msg);

                    let inputMsg = document.getElementById("input-message")
                    inputMSg.value = ""
                    inputMsg.disabled = false

                    if (msg.id) {
                        let div = document.createElement('div')
                        div.classList.add("your-messages", "message-box")
                        let div2 = document.createElement("div")
                        div2.classList.add("image-outer")
                        let img = document.createElement("img")
                        img.src = "https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                        img.classList.add("user-pic")
                        div2.appendChild(img)
                        let div3 = document.createElement("div")
                        div3.classList.add('mine-message-box')
                        let div4 = document.createElement("div")
                        div4.classList.add('type-message')
                        let img2 = document.createElement("img")
                        img2.src = fileUrl
                        div4.appendChild(img2)
                        div3.appendChild(div4)
                        div.appendChild(div2)
                        div.appendChild(div3)

                        let div_del = document.createElement("div")
                        div_del.classList.add("delete_icon")
                        div_del.setAttribute('onclick', `deleteOneMsg("${msg.id}")`)
                        let img_del = document.createElement("img")
                        img_del.src = "images/bin.png"
                        img_del.title = "Delete"
                        div_del.appendChild(img_del)
                        div.appendChild(div_del)

                        let divTime = document.createElement("div")
                        divTime.classList.add("time-chat-sending")
                        let timeTxt = document.createTextNode(new Date().getHours() + ":" + new Date().getMinutes())
                        divTime.appendChild(timeTxt)
                        div.appendChild(divTime)
                        // container.insertBefore(divTime, container.childNodes[0])
                        container.insertBefore(div, container.childNodes[0])

                        // console.log(_userID, msg);

                        for (const item of userArray) {
                            let dialogue = item.dataset.userId
                            if (dialogue == _userID) {
                                let msgDiv = item.getElementsByClassName("user-message")
                                let txtMsg = msgDiv[0].childNodes[0]
                                let txtNode = document.createTextNode("Attachment")
                                txtMsg.remove()
                                msgDiv[0].appendChild(txtNode)
                                userArray.forEach((item, key) => {
                                    let value = item.getAttribute('data-user-id')
                                    if (value == _userID) {
                                        item.remove()
                                        leftSide.appendChild(item)

                                    }

                                })


                            }


                        }
                    }
                    // return true
                }




            }
            )
        }
        else {
            if (inputField.value.length > 0) {

                let msg = {
                    type: 'chat',
                    body: inputField.value,
                    extension: {
                        save_to_history: 1,
                        dialog_id: admin.currentDialogue
                    },
                    markable: 1
                };
                var msgSenderID = parseInt(admin.currentUserID);
                inputField.value = ""
                msg.id = QB.chat.send(msgSenderID, msg);

                if (msg.id) {
                    let div = document.createElement('div')
                    div.classList.add("your-messages", "message-box")
                    let div2 = document.createElement("div")
                    div2.classList.add("image-outer")
                    let img = document.createElement("img")
                    img.src = "https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                    img.classList.add("user-pic")
                    div2.appendChild(img)
                    let div3 = document.createElement("div")
                    div3.classList.add('mine-message-box')
                    let div4 = document.createElement("div")
                    div4.classList.add('type-message')
                    let div4TxtNode = document.createTextNode(msg.body)
                    div4.appendChild(div4TxtNode)
                    div3.appendChild(div4)
                    div.appendChild(div2)
                    div.appendChild(div3)

                    let div_del = document.createElement("div")
                    div_del.classList.add("delete_icon")
                    div_del.setAttribute('onclick', `deleteOneMsg("${msg.id}")`)
                    let img_del = document.createElement("img")
                    img_del.src = "images/bin.png"
                    img_del.title = "Delete"
                    div_del.appendChild(img_del)
                    div.appendChild(div_del)

                    // <div class="delete_icon" onclick='deleteOneMsg("${item._id}")' >
                    // <img src='images/bin.png' title="Delete"/>
                    // </div>



                    let divTime = document.createElement("div")
                    divTime.classList.add("time-chat-sending")
                    let timeTxt = document.createTextNode(new Date().getHours() + ":" + new Date().getMinutes())
                    divTime.appendChild(timeTxt)
                    div.appendChild(divTime)
                    // container.insertBefore(divTime, container.childNodes[0])
                    container.insertBefore(div, container.childNodes[0])

                    // console.log(_userID, msg);

                    for (const item of userArray) {
                        let dialogue = item.dataset.userId
                        if (dialogue == _userID) {
                            let msgDiv = item.getElementsByClassName("user-message")
                            let txtMsg = msgDiv[0].childNodes[0]
                            let txtNode = document.createTextNode(msg.body)
                            txtMsg.remove()
                            msgDiv[0].appendChild(txtNode)
                            userArray.forEach((item, key) => {
                                let value = item.getAttribute('data-user-id')
                                if (value == _userID) {
                                    item.remove()
                                    leftSide.appendChild(item)

                                }

                            })


                        }


                    }
                }

            }
        }
    }


})

input_files.addEventListener("change", function () {
    var file = document.getElementById("input_files")
    var inputFile = file.files[0];
    console.log(inputFile);

    if (inputFile) {
        if ((inputFile.size / (1024 * 1024)) > 5) {
            file.File = []
            alert("Attachment size is more than 5mb")
            return true
        }
    }


    if (inputFile) {
        let inputMSg = document.getElementById("input-message")
        inputMSg.value = "Attachment"
        inputMSg.disabled = true

    }
    
})


function onMsgListener(userID) {

    QB.chat.onMessageListener = onMessage;


    function onMessage(userId, msg) {
        unreadStatusCount()
        let _userID = admin.adminId
        let senderID = admin.currentUserID
        let userArray = document.querySelectorAll(".user")

        console.log(userId);
        console.log(msg);

        let audio = document.getElementById("msgSound")

        setTimeout(() => {
            audio.play()

        });


        // Move the user at the top of the list

        userArray.forEach((item, key) => {
            let dialogue = item.dataset.userId
            if (dialogue == userId) {
                let msgDiv = item.getElementsByClassName("user-message")
                let txtMsg = msgDiv[0].childNodes[0]
                
                let txtNode = document.createTextNode( msg.body)
                txtMsg.remove()
                msgDiv[0].appendChild(txtNode)
                userArray.forEach((item, key) => {
                    let value = item.getAttribute('data-user-id')
                    if (value == userId) {
                        item.remove()
                        leftSide.appendChild(item)

                    }

                })

                // break
            } else {
                if (key == userArray.length - 1) {

                    console.log(msg);
                    if (msg.body !== "Imonlinerandomlyaa") {

                        // chatDialogues()
                    }


                }

            }


        })

        // Check the attachments in the incoming messages....
        let imageHTML = document.createElement("img")
        // img.src = "https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
        if (msg.extension.hasOwnProperty("attachments")) {
            if (msg.extension.attachments.length > 0) {
                var fileUID = msg.extension.attachments[0].uid;
                var fileUrl = QB.content.privateUrl(fileUID);
                // var fileUrl = QB.content.publicUrl(fileUID); - content create and upload param 'public' = true
                // var  = "<img src='" + fileUrl + "' alt='photo'/>";
                let imageHTML = document.createElement("img")
                imageHTML.src = fileUrl
                imageHTML.id = "img_exist"
            }
        }

        // Show the incoming message in the message container

        if (msg) {


            if (userId == senderID) {


                let div = document.createElement('div')
                div.classList.add("mine-messages", "message-box")
                let div2 = document.createElement("div")
                div2.classList.add("image-outer")
                let img = document.createElement("img")
                img.src = "https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                img.classList.add("user-pic")
                div2.appendChild(img)
                let div3 = document.createElement("div")
                div3.classList.add('mine-message-box')
                let div4 = document.createElement("div")
                div4.classList.add('type-message')
                let div4TxtNode
                if (msg.body.startsWith("https:") || msg.body.startsWith("http:")) {
                    let imageHTML = document.createElement("img")
                    imageHTML.src = msg.body
                    div4.appendChild(imageHTML)

                } else {
                    div4TxtNode = document.createTextNode(msg.body)
                    div4.appendChild(div4TxtNode)
                }
                div3.appendChild(div4)
                div.appendChild(div2)
                div.appendChild(div3)


                let div_del = document.createElement("div")
                div_del.classList.add("delete_icon")
                div_del.setAttribute('onclick', `deleteOneMsg("${msg.id}")`)
                let img_del = document.createElement("img")
                img_del.src = "images/bin.png"
                img_del.title = "Delete"
                div_del.appendChild(img_del)
                div.appendChild(div_del)

                let divTime = document.createElement("div")
                divTime.classList.add("time-chat-sending")
                let timeTxt = document.createTextNode(new Date().getHours() + ":" + new Date().getMinutes())
                divTime.appendChild(timeTxt)
                div.appendChild(divTime)
                // container.insertBefore(divTime, container.childNodes[0])
                container.insertBefore(div, container.childNodes[0])

                // console.log(userId, msg);
            }

        }

        // Bold the unread message
        if (userId !== parseInt(admin.currentUserID)) {


            for (let index = 0; index < userArray.length; index++) {
                let item = userArray[index]
                let userID = item.dataset.userId
                if (userID == userId) {
                    let msgDiv = item.getElementsByClassName("user-message")
                    msgDiv[0].style.fontWeight = "bold"
                    msgDiv[0].style.fontStyle = "italic"

                }



            }


        }


        let userFound = false
        if (userId) {


            for (let index = 0; index < userArray.length; index++) {
                let item = userArray[index]
                let userID = item.dataset.userId
                if (userID == userId) {
                    // let msgDiv = item.getElementsByClassName("user-message")
                    // msgDiv[0].style.fontWeight = "bold"
                    // msgDiv[0].style.fontStyle = "italic"
                    userFound = true

                }



            }


        }
        if (!userFound) {
            console.log('mil gia');

            userArry.map((item, key) => {

                if (item.user_id == userId) {

                    return leftSide.innerHTML += `<li class="user"  data-user-id="${item.user_id}" data-dialogue-id="${item._id}" >
                                            <div class="user-detail" onclick="getUserMsg('${item._id}' , '${item.user_id}' , '${item.name}')" data-user-id="${item.user_id}">
                                            <div class="image-outer">
                                                <img src="https://i1.sndcdn.com/avatars-avI8WNqzZkFhR4di-POKrYA-t500x500.jpg"
                                                alt="" class="user-image">
                                                </div>
                                                <div class="user-name-outer" id="user-name-outer">
                                                    <div class="user-name" id="user_name_div">
                                                    ${item.name}
                                                    </div>
                                                    <div class="user-message">
                                                        ${msg.body == "Imonlinerandomlyaa" ? "You have a new message" : msg.body}
                                                        </div>
                                                    </div>
                                                    <div class="delete_icon" onclick='deleteAllMessages("${item._id}" , "${item.user_id}")' >
                                                        <img src='images/bin.png' title="Delete"/>
                                                    </div> 
                                                    </div>
                                            </li>`
                }

            })
            unreadStatusCount()
            userFound = false

        }





        // checkOnlineStatus(userId)




    }


    QB.chat.onSentMessageCallback = function (messageLost, messageSent) {
        if (messageLost) {
            console.error('sendErrorCallback', messageLost);
        } else {
            console.info('sendMessageSuccessCallback', messageSent);

        }
    };

}

// function checkOnlineStatus(userId) {
//     let userArray = document.querySelectorAll(".user")

//     if (userId) {

//         for (const item of userArray) {
//             let dialogue = item.dataset.userId
//             if (dialogue == userId) {
//                 let msgDiv = item.getElementsByClassName("unreadStatus")
//                 msgDiv[0].style.color = '#23c552'
//                 msgDiv[0].title = 'online'
//                 // console.log(msgDiv[0].style.color);

//                 if (msgDiv[0].style.color == "rgb(35, 197, 82)") {

//                     setTimeout(() => {
//                         msgDiv[0].title = 'offline'
//                         msgDiv[0].style.color = '#a9a9a9'

//                     }, 120000);

//                 }

//             }



//         }
//     }
// }

function unreadStatusCount() {
    readStatus()
    let userArray = document.querySelectorAll(".user")
    // console.log(userArry);

    userArry.map((item, key) => {

        var params = {
            chat_dialog_ids: [item._id]
        };

        QB.chat.message.unreadCount(params, function (error, result) {
            if (error) {

                // console.log(error);
            } else {

                let dialogue_unread = Object.keys(result)[1]
                let unread_messages_count = Object.values(result)[1]
                // console.log(unread_messages_count);

                if (unread_messages_count !== 0) {

                    // console.log("it works");


                    for (const item of userArray) {

                        let dialogue = item.dataset.dialogueId
                        // console.log(dialogue, dialogue_unread);

                        if (dialogue_unread == dialogue) {
                            if (dialogue_unread !== admin.currentDialogue) {

                                let divCount = item.querySelector("#unread-msg-count")
                                console.log(divCount);
                                if (divCount) {
                                    divCount.innerHTML = unread_messages_count
                                    return true
                                }
                                if (item.dataset.dialogueId == dialogue_unread) {


                                    let user_list_msg = document.getElementById("user-name-outer")
                                    let div = document.createElement("div")
                                    div.id = "unread-msg-count"
                                    div.classList.add("user-message", "unread-numbers")
                                    let txtNode = document.createTextNode(unread_messages_count)
                                    div.appendChild(txtNode)
                                    item.querySelector("#user-name-outer").appendChild(div)
                                    let msgDiv = item.getElementsByClassName("user-message")
                                    msgDiv[0].style.fontWeight = "bold"
                                    msgDiv[0].style.fontStyle = "italic"

                                }


                            }
                        }


                    }


                }


            }

        });

    })
};

function deleteOneMsg(msgId) {

    let isConfirm = confirm("Are you sure you want to delete?")
    // console.log(isConfirm);

    if (isConfirm) {

        var params = {};
        QB.chat.message.delete(
            [msgId],
            params,
            function (error, result) {

                if (error) {
                    // console.log(error);
                } else {
                    // success
                    let res = JSON.parse(result)
                    // console.log(res);

                    if (res.SuccessfullyDeleted.ids.length > 0) {

                        let allBinsDiv = document.querySelectorAll('.message-box')
                        allBinsDiv.forEach((item, key) => {
                            let msgID = item.dataset.msgId
                            if (msgID == msgId) {
                                if (item.previousElementSibling) {


                                    // item.previousElementSibling.remove()
                                    item.remove()
                                }
                                // if (item.nextElementSibling) {
                                //     item.nextElementSibling.remove()
                                //     item.remove()

                                // }
                            }
                        })
                    }

                }

            }
        );

    }
}

function deleteAllMessages(dialogueID, msgToBeSent) {

    let isConfirm = confirm("Are you sure you want to delete?")
    // console.log(isConfirm);
    let userArray = document.querySelectorAll(".user")


    var params = {
        chat_dialog_id: dialogueID,
        sort_desc: 'date_sent',
        limit: 100,
        skip: 0
    };
    if (isConfirm) {

        QB.chat.message.list(params, function (error, messages) {
            if (error) {
                // console.log(error);

            } else {
                // console.log(messages)
                messages.items.map((item, key) => {



                    var params = {};
                    QB.chat.message.delete(
                        [item._id],
                        params,
                        function (error, result) {

                            if (error) {
                                console.log(error);
                            } else {
                                // success
                                let res = JSON.parse(result)
                                console.log(res);

                                if (res.SuccessfullyDeleted.ids.length > 0) {

                                    console.log("works....");

                                }

                            }

                        }
                    );


                })
                for (const item of userArray) {
                    let container = document.getElementById('message-container')
                    let dialogue = item.dataset.dialogueId
                    // console.log(dialogue, dialogue_unread);
                    if (dialogueID == dialogue) {

                        item.remove()
                        container.innerHTML = " "


                    }
                }

                chatDialogues()
                sendNullMSg(dialogueID, msgToBeSent)
            }
        })


    }
}

function sendNullMSg(dialogueId, userID) {

    let msg = {
        type: 'chat',
        body: null,
        extension: {
            save_to_history: 1,
            dialog_id: dialogueId
        },
        markable: 1
    };
    var msgSenderID = parseInt(userID);
    inputField.value = ""
    msg.id = QB.chat.send(msgSenderID, msg);
    if (msg.id) {
        console.log(msg);

    }
}


function getUserById() {

    let userArray = document.querySelectorAll(".user")

    userArry.map((outerItem, key) => {
        // console.log(outerItem);

        var searchParams = { filter: { field: 'id', param: 'in', value: [outerItem.user_id] } };

        QB.users.listUsers(searchParams, function (error, result) {

            for (const item of userArray) {

                let user_id = item.dataset.userId
                // console.log(item);
                if (outerItem.user_id == user_id) {
                    // console.log('works');

                    let name_div = item.querySelector("#user-name-outer")
                    name_div.title = result.items[0].user.email

                }


            }


        });
    });
}
// window.onload = function () {
//     console.log("works");

// }

closeWindow.addEventListener("click", () => {


    if (confirm("are you sure you want to close?")) {
        // QB.chat.disconnect();
        // window.open("index.html", "_top", "")
        // window.open('','_parent','');
        window.close();
    }

})

function readStatus() {
    var params = {
        messageId: "557f1f22bcf86cd784439022",
        userId: 113093460,
        dialogId: "5ef391eba28f9a7e9f14c23d"
    };

    QB.chat.sendReadStatus(params);

    //...

    QB.chat.onReadStatusListener = function (messageId, dialogId, userId) {

        console.log(messageId);
        console.log(dialogId);
        console.log(userId);


    };
}

// window.onload = function(){

//     let audio = document.createElement("audio")
//     audio.src = "sound/notification.mp3"
//     document.body.appendChild(audio)
// }


var app = new App(QBconfig);