import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
	return {
		success: true,
		message: "Test API route works!"
	};
});
