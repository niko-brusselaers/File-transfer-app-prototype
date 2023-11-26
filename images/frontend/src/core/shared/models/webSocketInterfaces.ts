import SimplePeer from "simple-peer";

interface IUserConnected {
    message: string;
    status: number;
    users: string[];

}

interface IUserDisconnected {
    message: string;
    status: number;
    name: string;
}

interface ILogin {
    message: string;
    status: number;
    users: string[] | undefined;
}

interface ISendRequestIncoming {
    sender:string;
    receiver:string;
    filename:string;
    filesize:number;
    signal:SimplePeer.SignalData;
}

interface ISendRequestOutgoing extends ISendRequestIncoming {
    receiver:string;
}

interface ISendResponse{
    signal:SimplePeer.SignalData;
    status:number;
}

export type {IUserConnected, IUserDisconnected, ILogin, ISendRequestIncoming, ISendRequestOutgoing, ISendResponse}