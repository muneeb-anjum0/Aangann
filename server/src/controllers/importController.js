// Import controller
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
import cloud from "../lib/cloudinary.js";

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img","h1","h2","h3","table","thead","tbody","tr","th","td","figure","figcaption","span"]),
  allowedAttributes: {
    "*": ["style"],
    a: ["href","name","target","rel"],
    img: ["src","alt","title","width","height","style"]
  },
  allowedStyles: {
    "*": {
      "text-align": [/^left$|^right$|^center$|^justify$/],
      "font-size": [/^\d+(px|em|rem|%)$/],
      "font-weight": [/^\d+$/],
      "font-style": [/^italic$|^normal$/],
      "font-family": [/^[a-zA-Z0-9 ,'"-]+$/]
    },
    img: {
      "float": [/^left$|^right$|^none$/],
      "margin": [/^\d+(px|em|rem|%)($| \d+(px|em|rem|%)){0,3}$/],
      "width": [/^\d+(px|%)$/],
      "height": [/^\d+(px|%)$/]
    }
  },
  transformTags: {
  h1: "h2", // Map big headings to blog scale
  }
};

export const importDocx = async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({message:"No file"});
    if(req.file.mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
      return res.status(400).json({message:"Upload a .docx file"});
    }

    const result = await mammoth.convertToHtml(
      { buffer: req.file.buffer },
      {
        styleMap: [
          "p[style-name='Title'] => h2:fresh",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh"
        ].join("\n"),
        convertImage: mammoth.images.inline(async (element) => {
          const b64 = await element.read("base64");
          const upload = await cloud.uploader.upload(`data:${element.contentType};base64,${b64}`, {
            folder: "aangan-blog-pro/content",
            resource_type: "image"
          });
          return { src: upload.secure_url };
        })
      }
    );

    const html = sanitizeHtml(result.value, sanitizeOptions);
    return res.json({ html });
  }catch(err){
    console.error(err);
    return res.status(500).json({message:"Import failed"});
  }
};
