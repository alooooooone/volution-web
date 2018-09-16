export const fetchData = async(url, cb) => {
    let resJson = await fetch(url);
    if(resJson.ok){
        let res = await resJson.json()
        console.log(res)
        cb(res)
    }else{
        return false
    }
}