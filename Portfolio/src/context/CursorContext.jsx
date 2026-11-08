import React, { createContext, useContext, useState, useCallback } from "react";

const CursorContext = createContext({
  cursorType: "default",
  cursorText: "",
  setCursor: () => {},
  resetCursor: () => {},
});

export const CursorProvider = ({ children }) => {
  const [cursorType, setCursorType] = useState("default");
  const [cursorText, setCursorText] = useState("");

  const setCursor = useCallback((type = "default", text = "") => {
    setCursorType(type);
    setCursorText(text);
  }, []);

  const resetCursor = useCallback(() => {
    setCursorType("default");
    setCursorText("");
  }, []);

  return (
    <CursorContext.Provider
      value={{ cursorType, cursorText, setCursor, resetCursor }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => useContext(CursorContext);
