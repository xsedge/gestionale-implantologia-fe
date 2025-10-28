import { Notify } from "quasar";

// type can be positive, negative, warning, info
export const showNotification = (
    type,
    message,
    timeout = type == "positive" ? 4000 : 0,
    position = "top",
    icon = type == "positive" ? "check" : ""
) => {
    let actions =
        type == "positive"
            ? []
            : [{ label: "Chiudi", icon: "close", color: "white" }];

    Notify.create({
        position,
        timeout,
        type,
        html: true,
        message,
        multiLine: type == "positive" ? false : true,
        actions,
        icon,
        classes: type == "positive" ? null : "my-notification",
        textColor: "white",
        group: false,
    });
};