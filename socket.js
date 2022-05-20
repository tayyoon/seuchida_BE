const SocketIO = require('socket.io');
const moment = require('moment');
const Chat = require('./schemas/chatting');
const Room = require('./schemas/room');
const Post = require('./schemas/post');
const socketauthMiddleware = require('./middlewares/socket-auth-middleware');

module.exports = (server) => {
    const io = SocketIO(server, {
        path: '/socket.io',
        cors: { 
            origins: '*:*'
        }
    });
    console.log('소켓IO 서버 오픈'); //로그인완료되자마자 소켓에 유저를 연결시켜서 유저 id를 받고 그걸로 강퇴기능을 구현하면 될거같다.
    require('moment-timezone'); //socket.to(밴당할 userId).emit('ban') 이렇게 보내면 밴당한 유저소켓에서 socket.on으로 받고 밴당한유저 
    moment.tz.setDefault('Asia/Seoul'); //소켓으로 다시 서버로 socket.emit 보내면 서버에서 socket.leave해주면 될듯
    io.use(socketauthMiddleware)
    io.on('connection', async function (socket) {
        const { userId, nickName, userImg } = socket.user;
        socket.join(userId)
        socket.on('join', function (data) {
            console.log(nickName + '님이 입장하셨습니다.');
            socket.join(data.roomId);
            Room.updateOne(
                { roomId: data.roomId },
                { $addToSet: { nowMember: [ userId ] } },
                function (err, output) {
                    if (err) {
                        console.log(err);
                    }
                    if (!output) {
                        return;
                    }
                    Room.findOne({ roomId: data.roomId }, function (err, room) {
                        io.sockets.in(data.roomId).emit('userlist', room.nowMember); //자신포함 룸안의 전체유저한테 보내기
                    });
                }
            );

            Chat.find({ room: data.roomId }, function (err, chats) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (!chats) {
                    console.log('채팅 내용이 없습니다');
                    return;
                }

                io.sockets.in(data.roomId).emit('chatlist', chats);
                var msg = {
                    room: data.roomId,
                    name: 'System',
                    msg: nickName + '님이 입장하셨습니다.',
                    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                };

                //DB 채팅 내용 저장
                var chat = new Chat();
                chat.room = data.roomId;
                chat.name = 'System';
                chat.msg = nickName + '님이 입장하셨습니다.';
                chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

                chat.save(function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });

                io.sockets.in(data.roomId).emit('broadcast', msg);
            }).sort({ createdAt: 1 });
        });

        socket.on('chat', function (data) {
            var msg = {
                room: data.roomId,
                name: nickName,
                msg: data.msg,
                userImg: userImg,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            io.sockets.in(data.roomId).emit('broadcast', msg);
            // let chatUser = Room.find({
            //     roomId: data.roomId
            // })
            // let chatUser1 ='';
            // for(let i=0; i<chatUser.length; i++) {
            //     chatUser1 = chatUser.nowMember[i][0]
            //     io.sockets.in(chatUser1).emit('alert',msg)
            // }
            //DB 채팅 내용 저장
            var chat = new Chat();
            chat.room = data.roomId;
            chat.name = nickName;
            chat.msg = data.msg;
            chat.userId = userId;
            chat.userImg = userImg;
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

            chat.save(function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(
                    'Message %s from %s: %s',
                    data.roomId,
                    nickName,
                    data.msg
                );
            });
        });
        // socket.on('back')
        socket.on('leave', function (data) {
            console.log(nickName + '님이 퇴장하셨습니다.');
            socket.leave(data.roomId);

            Room.updateOne(
                { roomId: data.roomId },
                { $pullAll: { nowMember: [ [ userId ] ] } },
                function (err, output) {
                    if (err) {
                        console.log(err);
                    }
                    if (!output) {
                        return;
                    }
                    Room.findOne({ roomId: data.roomId }, function (err, room) {
                        io.sockets.in(data.roomId).emit('userlist', room.nowMember);
                    });
                }
            );

            var msg = {
                room: data.roomId,
                name: 'System',
                msg: nickName + '님이 퇴장하셨습니다.',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            };

            //DB 채팅 내용 저장
            var chat = new Chat();
            chat.room = data.roomId;
            chat.name = 'System';
            chat.msg = nickName + '님이 퇴장하셨습니다.';
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

            chat.save(function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
            });

            io.sockets.in(data.roomId).emit('broadcast', msg);
        });
        socket.on('banUser', (data) => { //방장이 서버로 이사람 강퇴해달라 신호보내는거
            let msg = true;
            io.sockets.in(data.userId).emit('ban', msg)// 서버에서 강퇴당할 사람에게 니가 서버로 다시 신호보내라고 하는거
        })
        socket.on('banUserOut', (data) => { //강퇴당한 사람이 서버로 나 강퇴시켜달라 신호보내는거 
            console.log(nickName + '님이 강퇴당하셨습니다.');
            socket.leave(data.roomId);

            Post.updateOne(
                { roomId: data.roomId },
                { $pullAll: { nowMember: [ [ userId ] ] },
                  $addToSet: { banUserList: [ userId ] }
                },
                function (err, output) {
                    if (err) {
                        console.log(err);
                    }
                    if (!output) {
                        return;
                    }
                }
            );

            Room.updateOne(
                { roomId: data.roomId },
                { $pullAll: { nowMember: [ [ userId ] ] },
                  $addToSet: { banUserList: [ userId ] }
                },
                function (err, output) {
                    if (err) {
                        console.log(err);
                    }
                    if (!output) {
                        return;
                    }
                    Room.findOne({ roomId: data.roomId }, function (err, room) {
                        io.sockets.in(data.roomId).emit('userlist', room.nowMember);
                    });
                }
            );
            var msg = {
                room: data.roomId,
                name: 'System',
                msg: nickName + '님이 강퇴당하셨습니다.',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            };

            //DB 채팅 내용 저장
            var chat = new Chat();
            chat.room = data.roomId;
            chat.name = 'System';
            chat.msg = nickName + '님이 강퇴당하셨습니다.';
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

            chat.save(function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
            });

            io.sockets.in(data.roomId).emit('broadcast', msg);
        })
        socket.on('disconnet', () => {
            clearInterval(socket.interval);
        });
    });
};
