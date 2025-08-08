import { findByProps } from "@webpack";
import { after } from "@utils/patcher";
import { persist } from "@utils/storage";
import { React } from "@metro/common";

const UserPopout = findByProps("UserPopoutInfo");
const STORAGE_KEY = "SavedLeftMembersRoles";

export default {
  name: "OldRolesCopy",
  description: "Saves roles before members leave and shows them with copy button in profile",

  start() {
    this.unpatch = after("default", UserPopout, ([props], res) => {
      const user = props?.user;
      if (!user) return;

      const saved = persist.ghost[STORAGE_KEY] || [];
      const match = saved.find(entry => entry.userId === user.id);
      if (!match) return;

      const roleText = match.roles.join(" | ");

      const copyButton = React.createElement(
        "button",
        {
          style: {
            marginLeft: "10px",
            padding: "2px 8px",
            fontSize: "12px",
            cursor: "pointer",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#ff4d4d",
            color: "white",
            fontWeight: "bold",
          },
          onClick: () => {
            navigator.clipboard.writeText(roleText).then(() => {
              const toast = document.createElement("div");
              toast.textContent = "Roles copied!";
              toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff4d4d;
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 9999;
                opacity: 0.9;
              `;
              document.body.appendChild(toast);
              setTimeout(() => document.body.removeChild(toast), 2000);
            });
          },
          type: "button",
          "aria-label": "Copy roles",
          title: "Copy roles",
        },
        "Copy"
      );

      const roleElement = React.createElement(
        "div",
        {
          style: {
            color: "red",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
          }
        },
        React.createElement("span", null, `Roles before leaving: ${roleText}`),
        copyButton
      );

      const children = res?.props?.children;
      if (Array.isArray(children)) {
        children.push(roleElement);
      }

      return res;
    });
  },

  stop() {
    this.unpatch?.();
  }
};