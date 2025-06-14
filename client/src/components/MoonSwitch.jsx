export const MoonSwitch = styled(Switch)(({ theme }) => ({
  width: 60,
  height: 34,
  padding: 8,
  "& .MuiSwitch-switchBase": {
    margin: 3,
    padding: 0,
    transform: "translateX(5px)",
    "&.Mui-checked": {
      transform: "translateX(22px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "white",

        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    width: 28,
    height: 28,
    borderRadius: "50%",
    boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.2)",
    position: "relative",
    "&:before": {
      content: '"☀️"',
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb:before": {
    content: '"🌙"',
  },

  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    backgroundColor: "#ccc",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
