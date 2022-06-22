import { updateManyUsers } from "./user.service";

export function alertAllUsers(message: any) {
    const q = {
        $push: {
            "Alerts": {
                type: "game-update",
                date: new Date(),
                importance: "high",
                message,
                isSeen: false
            }
        }
    }
    updateManyUsers({ }, q)
    .then(() => {
        console.log('game-update', q);
})
  .catch((err: any) => {
    console.log('error', err);
  });
}