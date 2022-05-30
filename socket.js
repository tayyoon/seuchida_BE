const SocketIO = require('socket.io')
const moment = require('moment')
const Chat = require('./schemas/chatting')
const Room = require('./schemas/room')
const Post = require('./schemas/post')
const socketauthMiddleware = require('./middlewares/socket-auth-middleware')
const { v4 } = require('uuid')

module.exports = (server) => {
    const io = SocketIO(server, {
        path: '/socket.io',
        cors: { 
            origins: '*:*',
            methods: ["GET", "POST"],
            transports: ['websocket'],
            credentials: true
        },
        allowEIO3: true,
        // pingInterval: 9000,
        // pingTimeout: 15000,
    });
    console.log('소켓IO 서버 오픈'); 
    require('moment-timezone');
    moment.tz.setDefault('Asia/Seoul');
    io.use(socketauthMiddleware)
    io.on('connection', async function (socket) {
        const { userId, nickName, userImg } = socket.user
        socket.on('disconnect', () => {
            console.log(nickName + '님이 접속을 해제하셨습니다.')
            // clearInterval(socket.interval);
        })
        socket.join(userId)
        // socket.on('login', () => {
        console.log(nickName + '님이 접속하셨습니다.')
        //     socket.join(userId);
        // });

        socket.on('join', function (data) {
            console.log(nickName + '님이 입장하셨습니다.')
            socket.join(data.roomId)
            Room.updateOne(
                { roomId: data.roomId },
                { $addToSet: { nowMember: [userId] } },
                function (err, output) {
                    if (err) {
                        console.log(err)
                    }
                    if (!output) {
                        return
                    }
                    Room.findOne({ roomId: data.roomId }, function (err, room) {
                        io.sockets
                            .in(data.roomId)
                            .emit('userlist', room.nowMember) //자신포함 룸안의 전체유저한테 보내기
                    })
                }
            )

            Chat.find(
                {
                    room: data.roomId,
                    name: { $ne: 'Systemback' },
                },
                function (err, chats) {
                    if (err) {
                        console.log(err)
                        return
                    }
                    if (!chats) {
                        console.log('채팅 내용이 없습니다')
                        return
                    }

                    io.sockets.in(data.roomId).emit('chatlist', chats)
                    var msg = {
                        room: data.roomId,
                        name: 'System',
                        msg: nickName + '님이 입장하셨습니다.',
                        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    }

                    //DB 채팅 내용 저장
                    var chat = new Chat()
                    chat.room = data.roomId
                    chat.name = 'System'
                    chat.msg = nickName + '님이 입장하셨습니다.'
                    chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
                    let a = chat.createdAt.split(' ')
                    let b = a[0].split('-')
                    let c = a[1].split(':')
                    let d = b.join('')
                    let e = c.join('')
                    let f = d + e
                    chat.check = Number(f)
                    chat.save(function (err) {
                        if (err) {
                            console.error(err)
                            return
                        }
                    })

                    io.sockets.in(data.roomId).emit('broadcast', msg)
                }
            ).sort({ createdAt: 1 })
        })

        socket.on('chat', function (data) {
            var msg = {
                room: data.roomId,
                name: nickName,
                msg: data.msg,
                userImg: userImg,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            }
            io.sockets.in(data.roomId).emit('broadcast', msg)
            if (data.userId) {
                for (let i = 0; i < data.userId.length; i++) {
                    io.sockets.in(data.userId[i]).emit('alert', msg)
                }
            }

            //DB 채팅 내용 저장
            var chat = new Chat()
            chat.room = data.roomId
            chat.name = nickName
            chat.msg = data.msg
            chat.userId = userId
            chat.userImg = userImg
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
            let a = chat.createdAt.split(' ')
            let b = a[0].split('-')
            let c = a[1].split(':')
            let d = b.join('')
            let e = c.join('')
            let f = d + e
            chat.check = Number(f)

            chat.save(function (err) {
                if (err) {
                    console.error(err)
                    return
                }
                console.log(
                    'Message %s from %s: %s',
                    data.roomId,
                    nickName,
                    data.msg
                )
            })
        })

        socket.on('joinParty', async function (data) {
            const uuid = () => {
                const tokens = v4().split('-')
                return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
            }
            const msgId = uuid()
            const postInfo = await Post.findOne({
                _id: data.postId,
            })
            var msg = {
                userId: userId,
                nickName: nickName,
                userImg: userImg,
                postId: data.postId,
                postTitle: postInfo.postTitle,
                msgId,
            }
            console.log('msg', msg)
            for (let i = 0; i < data.userId.length; i++) {
                if (userId !== data.userId[i]) {
                    io.sockets.in(data.userId[i]).emit('joinPartyAlert', msg)
                }
            }
        })

        //채팅방 뒤로가기 눌럿을때 data에 roomId 넣어주기
        socket.on('back', function (data) {
            console.log(nickName + '님이 잠시 퇴장하셨습니다.')
            socket.leave(data.roomId)

            //DB 채팅 내용 저장
            var chat = new Chat()
            chat.room = data.roomId
            chat.name = 'Systemback'
            chat.userId = data.userId
            chat.msg = nickName + '님이 잠시 퇴장하셨습니다.'
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
            let a = chat.createdAt.split(' ')
            let b = a[0].split('-')
            let c = a[1].split(':')
            let d = b.join('')
            let e = c.join('')
            let f = d + e
            chat.check = Number(f)

            chat.save(function (err) {
                if (err) {
                    console.error(err)
                    return
                }
            })
        })

        socket.on('leave', function (data) {
            console.log(nickName + '님이 퇴장하셨습니다.')
            socket.leave(data.roomId)

            Room.updateOne(
                { roomId: data.roomId },
                { $pullAll: { nowMember: [[userId]] } },
                function (err, output) {
                    if (err) {
                        console.log(err)
                    }
                    if (!output) {
                        return
                    }
                    Room.findOne({ roomId: data.roomId }, function (err, room) {
                        io.sockets
                            .in(data.roomId)
                            .emit('userlist', room.nowMember)
                    })
                }
            )

            var msg = {
                room: data.roomId,
                name: 'System',
                msg: nickName + '님이 퇴장하셨습니다.',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            }

            //DB 채팅 내용 저장
            var chat = new Chat()
            chat.room = data.roomId
            chat.name = 'System'
            chat.msg = nickName + '님이 퇴장하셨습니다.'
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
            let a = chat.createdAt.split(' ')
            let b = a[0].split('-')
            let c = a[1].split(':')
            let d = b.join('')
            let e = c.join('')
            let f = d + e
            chat.check = Number(f)

            chat.save(function (err) {
                if (err) {
                    console.error(err)
                    return
                }
            })

            io.sockets.in(data.roomId).emit('broadcast', msg)
        })
        socket.on('banUser', (data) => {
            //방장이 서버로 이사람 강퇴해달라 신호보내는거
            let msg = true
            io.sockets.in(data.userId).emit('ban', msg) // 서버에서 강퇴당할 사람에게 니가 서버로 다시 신호보내라고 하는거
        })
        socket.on('banUserOut', (data) => {
            //강퇴당한 사람이 서버로 나 강퇴시켜달라 신호보내는거
            console.log(nickName + '님이 강퇴당하셨습니다.')
            socket.leave(data.roomId)

            Post.updateOne(
                { roomId: data.roomId },
                {
                    $pullAll: { nowMember: [[userId]] },
                    $addToSet: { banUserList: [userId] },
                },
                function (err, output) {
                    if (err) {
                        console.log(err)
                    }
                    if (!output) {
                        return
                    }
                }
            )

            Room.updateOne(
                { roomId: data.roomId },
                {
                    $pullAll: { nowMember: [[userId]] },
                    $addToSet: { banUserList: [userId] },
                },
                function (err, output) {
                    if (err) {
                        console.log(err)
                    }
                    if (!output) {
                        return
                    }
                    Room.findOne({ roomId: data.roomId }, function (err, room) {
                        io.sockets
                            .in(data.roomId)
                            .emit('userlist', room.nowMember)
                    })
                }
            )
            var msg = {
                room: data.roomId,
                name: 'System',
                msg: nickName + '님이 강퇴당하셨습니다.',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            }

            //DB 채팅 내용 저장
            var chat = new Chat()
            chat.room = data.roomId
            chat.name = 'System'
            chat.msg = nickName + '님이 강퇴당하셨습니다.'
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
            let a = chat.createdAt.split(' ')
            let b = a[0].split('-')
            let c = a[1].split(':')
            let d = b.join('')
            let e = c.join('')
            let f = d + e
            chat.check = Number(f)

            chat.save(function (err) {
                if (err) {
                    console.error(err)
                    return
                }
            })

            io.sockets.in(data.roomId).emit('broadcast', msg)
        })
    })
}
