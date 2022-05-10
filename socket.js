const SocketIO = require('socket.io');
const moment = require('moment');
const Chat = require('./schemas/chating');
const Room = require('./schemas/room');

module.exports = (server) => {
    const io = SocketIO(server, {
        path: '/socket.io',
        cors: { 
            origins: '*:*'
        }
    });
    console.log('소켓IO 서버 오픈');

    io.on('connection', function (socket) {
        socket.on('join', function (data) {
            console.log(data)
            console.log(data.nickname + '님이 입장하셨습니다.');
            socket.join(data.room);
            console.log('확인용')
            Room.updateOne(
                { _id: data.room },
                { $addToSet: { userList: data.userId } },
                function (err, output) {
                    if (err) {
                        console.log(err);
                    }
                    console.log(output);
                    if (!output) {
                        return;
                    }
                    Room.findOne({ _id: data.room }, function (err, room) {
                        io.sockets.in(data.room).emit('userlist', room.userList); //자신포함 룸안의 전체유저한테 보내기
                    });
                }
            );

            Chat.find({ room: data.room }, function (err, chats) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (!chats) {
                    console.log('채팅 내용이 없습니다');
                    return;
                }

                io.sockets.in(data.room).emit('chatlist', chats);
                var msg = {
                    room: data.room,
                    name: 'System',
                    msg: data.nickname + '님이 입장하셨습니다.',
                    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                };

                //DB 채팅 내용 저장
                var chat = new Chat();
                chat.room = data.room;
                chat.name = 'System';
                chat.msg = data.nickname + '님이 입장하셨습니다.';
                chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

                chat.save(function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });

                io.sockets.in(data.room).emit('broadcast', msg);
            }).sort({ createdAt: 1 });
        });

        socket.on('chat', function (data) {
            var msg = {
                room: data.room,
                name: data.name,
                msg: data.msg,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            io.sockets.in(data.room).emit('broadcast', msg);

            //DB 채팅 내용 저장
            var chat = new Chat();
            chat.room = data.room;
            chat.name = data.name;
            chat.msg = data.msg;
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

            chat.save(function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(
                    'Message %s from %s: %s',
                    data.room,
                    data.name,
                    data.msg
                );
            });
        });

        socket.on('leave', function (data) {
            console.log(data.nickname + '님이 퇴장하셨습니다.');
            socket.leave(data.room);

            Room.updateOne(
                { _id: data.room },
                { $pullAll: { userList: [data.userId] } },
                function (err, output) {
                    if (err) {
                        console.log(err);
                    }
                    console.log(output);
                    if (!output) {
                        return;
                    }
                    Room.findOne({ _id: data.room }, function (err, room) {
                        io.sockets.in(data.room).emit('userlist', room.userList);
                    });
                }
            );

            var msg = {
                room: data.room,
                name: 'System',
                msg: data.nickname + '님이 퇴장하셨습니다.',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            };

            //DB 채팅 내용 저장
            var chat = new Chat();
            chat.room = data.room;
            chat.name = 'System';
            chat.msg = data.nickname + '님이 퇴장하셨습니다.';
            chat.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

            chat.save(function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
            });

            io.sockets.in(data.room).emit('broadcast', msg);
        });
    });
};
