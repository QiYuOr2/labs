import Mock from 'mockjs'

// {
//   feedId: 2121317,
//   title: '带崽崽去满觉陇拍个照带崽崽去满觉陇拍个照',
//   thumbnail: 'https://si.geilicdn.com/img-6d0c00000183f444a34e0a2313a2_500_500.jpg',
//   promoteTime: '2022-10-24',
//   status: 1,
//   exposePv: 9999,
//   type: 0,
//   detailUrl:
//     'https://h5.weidian.com/m/koubei/content-detail.html?feedId=307095934&authorId=1400725121'
// }

const data = Mock.mock({
  'list|1-20': [{
    'feedId|+1': 100,
    title: '@ctitle(10, 30)',
    thumbnail: 'https://si.geilicdn.com/img-6d0c00000183f444a34e0a2313a2_500_500.jpg',
    promoteTime: '@date("yyyy-MM-dd")',
    status: '@integer(0, 1)',
    exposePv: '@integer(1000, 9999)',
    type: '@integer(0, 1)',
  }]
})

console.log(data)